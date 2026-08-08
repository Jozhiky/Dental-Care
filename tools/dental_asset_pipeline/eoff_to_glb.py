from __future__ import annotations

import argparse
import json
import math
import struct
from pathlib import Path

import numpy as np
import trimesh


class EoffError(RuntimeError):
    pass


def _read_header(data: bytes) -> tuple[int, str]:
    nl = data.find(b"\n")
    if nl < 0:
        raise EoffError("Missing newline after OFF BINARY header")
    header = data[:nl].decode("ascii", errors="replace").strip()
    if not header.startswith("OFF BINARY"):
        raise EoffError(f"Unsupported header: {header!r}")
    return nl + 1, header


def _plausible_counts(v: int, f: int, e: int, file_size: int) -> bool:
    if not (3 <= v <= 2_000_000 and 1 <= f <= 4_000_000 and 0 <= e <= 8_000_000):
        return False
    min_bytes = 12 + v * 12 + f * 16
    return min_bytes <= file_size * 1.25


def _detect_endian(data: bytes, offset: int) -> tuple[str, tuple[int, int, int]]:
    if len(data) < offset + 12:
        raise EoffError("File too short for OFF counts")

    candidates = []
    for endian in ("<", ">"):
        counts = struct.unpack_from(f"{endian}iii", data, offset)
        score = 0
        v, f, e = counts
        if _plausible_counts(v, f, e, len(data)):
            score += 10
        if v > 0:
            score += 1
        if f >= v:
            score += 1
        candidates.append((score, endian, counts))

    candidates.sort(reverse=True, key=lambda x: x[0])
    score, endian, counts = candidates[0]
    if score < 10:
        raise EoffError(f"Could not detect plausible endian/counts: {candidates}")
    return endian, counts


def _parse_faces_without_colors(data: bytes, offset: int, face_count: int, vertex_count: int, endian: str):
    triangles: list[tuple[int, int, int]] = []
    cursor = offset
    polygons = 0

    for _ in range(face_count):
        if cursor + 4 > len(data):
            raise EoffError("Unexpected EOF while reading face vertex count")
        (n,) = struct.unpack_from(f"{endian}i", data, cursor)
        cursor += 4
        if n < 3 or n > 64:
            raise EoffError(f"Invalid polygon vertex count {n} at byte {cursor - 4}")
        need = n * 4
        if cursor + need > len(data):
            raise EoffError("Unexpected EOF while reading face indices")
        indices = struct.unpack_from(f"{endian}{n}i", data, cursor)
        cursor += need
        if min(indices) < 0 or max(indices) >= vertex_count:
            raise EoffError(f"Face index out of range: min={min(indices)} max={max(indices)} v={vertex_count}")
        polygons += 1
        root = indices[0]
        for i in range(1, n - 1):
            triangles.append((root, indices[i], indices[i + 1]))

    return np.asarray(triangles, dtype=np.int64), cursor, polygons


def _parse_faces_geomview_colors(data: bytes, offset: int, face_count: int, vertex_count: int, endian: str):
    triangles: list[tuple[int, int, int]] = []
    cursor = offset
    polygons = 0

    for _ in range(face_count):
        if cursor + 4 > len(data):
            raise EoffError("Unexpected EOF while reading face vertex count")
        (n,) = struct.unpack_from(f"{endian}i", data, cursor)
        cursor += 4
        if n < 3 or n > 64:
            raise EoffError(f"Invalid polygon vertex count {n} at byte {cursor - 4}")
        need = n * 4
        if cursor + need + 4 > len(data):
            raise EoffError("Unexpected EOF while reading face indices/color count")
        indices = struct.unpack_from(f"{endian}{n}i", data, cursor)
        cursor += need
        if min(indices) < 0 or max(indices) >= vertex_count:
            raise EoffError(f"Face index out of range: min={min(indices)} max={max(indices)} v={vertex_count}")
        (color_count,) = struct.unpack_from(f"{endian}i", data, cursor)
        cursor += 4
        if color_count < 0 or color_count > 4:
            raise EoffError(f"Invalid color component count {color_count}")
        color_bytes = color_count * 4
        if cursor + color_bytes > len(data):
            raise EoffError("Unexpected EOF while reading face colors")
        cursor += color_bytes

        polygons += 1
        root = indices[0]
        for i in range(1, n - 1):
            triangles.append((root, indices[i], indices[i + 1]))

    return np.asarray(triangles, dtype=np.int64), cursor, polygons


def load_eoff(path: Path) -> tuple[trimesh.Trimesh, dict]:
    data = path.read_bytes()
    offset, header = _read_header(data)
    endian, (vertex_count, face_count, edge_count) = _detect_endian(data, offset)
    offset += 12

    vertex_bytes = vertex_count * 3 * 4
    if offset + vertex_bytes > len(data):
        raise EoffError("Unexpected EOF while reading vertices")

    vertices = np.frombuffer(data, dtype=np.dtype(f"{endian}f4"), count=vertex_count * 3, offset=offset)
    vertices = np.asarray(vertices, dtype=np.float64).reshape(vertex_count, 3)
    offset += vertex_bytes

    if not np.isfinite(vertices).all():
        raise EoffError("NaN/Infinity found in vertex positions")

    parsers = [
        ("exocad_no_face_colors", _parse_faces_without_colors),
        ("geomview_face_colors", _parse_faces_geomview_colors),
    ]
    errors: list[str] = []
    best = None

    for layout_name, parser in parsers:
        try:
            faces, end_cursor, polygons = parser(data, offset, face_count, vertex_count, endian)
            trailing = len(data) - end_cursor
            if trailing < 0:
                raise EoffError("Parser moved beyond EOF")
            # Exocad files may have a small proprietary tail. Prefer the parser
            # consuming the largest valid prefix without corrupt indices.
            score = trailing
            candidate = (score, layout_name, faces, end_cursor, polygons)
            if best is None or candidate[0] < best[0]:
                best = candidate
        except Exception as exc:
            errors.append(f"{layout_name}: {exc}")

    if best is None:
        raise EoffError("No supported binary OFF face layout matched. " + " | ".join(errors))

    trailing, layout_name, faces, end_cursor, polygons = best
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False, validate=False)
    mesh.remove_unreferenced_vertices()

    if not np.isfinite(mesh.vertices).all():
        raise EoffError("NaN/Infinity found after mesh construction")

    metadata = {
        "file": str(path),
        "header": header,
        "endian": "little" if endian == "<" else "big",
        "vertex_count_header": int(vertex_count),
        "face_count_header": int(face_count),
        "edge_count_header": int(edge_count),
        "triangles": int(len(mesh.faces)),
        "vertices_final": int(len(mesh.vertices)),
        "layout": layout_name,
        "trailing_bytes": int(trailing),
        "finite": True,
        "bounds": mesh.bounds.tolist(),
        "extents": mesh.extents.tolist(),
    }
    return mesh, metadata


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert Exocad .eoff (OFF BINARY) templates to PLY/GLB preview")
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("--output", type=Path, default=Path("output/eoff-converted"))
    args = parser.parse_args()

    source = args.input_dir
    output = args.output
    output.mkdir(parents=True, exist_ok=True)
    ply_dir = output / "ply"
    ply_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(source.rglob("*.eoff"), key=lambda p: (p.parent.name.lower(), int(p.stem) if p.stem.isdigit() else 999, p.name))
    print(f"EOFF_FILES={len(files)}")
    if not files:
        print("GAUNTLET_EOFF_CONVERT=FAIL")
        return 2

    scene = trimesh.Scene()
    manifest = []
    failures = []
    spacing_x = 18.0
    spacing_y = 20.0

    for idx, path in enumerate(files):
        try:
            mesh, meta = load_eoff(path)
            jaw = path.parent.name.lower()
            tooth_pos = int(path.stem) if path.stem.isdigit() else idx + 1
            node_name = f"{jaw}_{tooth_pos}"
            mesh.metadata["name"] = node_name
            mesh.export(ply_dir / f"{node_name}.ply")

            # Layout only for the diagnostic preview GLB. Individual meshes are
            # not altered in the PLY exports.
            preview = mesh.copy()
            preview.apply_translation(-preview.centroid)
            row = 0 if "upper" in jaw else 1
            col = (tooth_pos - 1) if 1 <= tooth_pos <= 8 else idx % 8
            preview.apply_translation([col * spacing_x, -row * spacing_y, 0.0])
            scene.add_geometry(preview, node_name=node_name, geom_name=node_name)

            manifest.append({"name": node_name, **meta})
            print(
                f"PASS={node_name} V={meta['vertices_final']} T={meta['triangles']} "
                f"ENDIAN={meta['endian']} LAYOUT={meta['layout']} TRAILING={meta['trailing_bytes']}"
            )
        except Exception as exc:
            failures.append({"file": str(path), "error": str(exc)})
            print(f"FAIL={path}:{exc}")

    glb_path = output / "eoff_templates_preview.glb"
    if manifest:
        glb_bytes = scene.export(file_type="glb")
        glb_path.write_bytes(glb_bytes)

    report = {
        "source": str(source),
        "eoff_files": len(files),
        "converted": len(manifest),
        "failures": failures,
        "meshes": manifest,
        "preview_glb": str(glb_path),
    }
    (output / "manifest.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    all_finite = all(item.get("finite") for item in manifest)
    print(f"CONVERTED={len(manifest)}")
    print(f"FAILURES={len(failures)}")
    print(f"FINITE_GEOMETRY={all_finite}")
    print(f"PREVIEW_GLB={glb_path}")

    if len(files) == 16 and len(manifest) == 16 and not failures and all_finite and glb_path.exists() and glb_path.stat().st_size > 0:
        print("GAUNTLET_EOFF_CONVERT=PASS")
        return 0

    print("GAUNTLET_EOFF_CONVERT=REVIEW")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
