from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import trimesh


def load_mesh(path: Path) -> trimesh.Trimesh:
    loaded = trimesh.load(path, process=False)
    if isinstance(loaded, trimesh.Scene):
        meshes = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
        if not meshes:
            raise RuntimeError("STL scene contains no triangle meshes")
        loaded = trimesh.util.concatenate(meshes)
    if not isinstance(loaded, trimesh.Trimesh):
        raise RuntimeError(f"Unsupported loaded type: {type(loaded).__name__}")
    return loaded


def finite_mesh(mesh: trimesh.Trimesh) -> bool:
    return bool(
        np.isfinite(np.asarray(mesh.vertices)).all()
        and np.isfinite(np.asarray(mesh.faces)).all()
        and mesh.bounds is not None
        and np.isfinite(np.asarray(mesh.bounds)).all()
    )


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Gauntlet for a combined upper/lower dental STL: validate and split connected tooth components."
    )
    ap.add_argument("input_stl", type=Path)
    ap.add_argument("--output", type=Path, default=Path("output/combined-stl"))
    ap.add_argument(
        "--min-face-ratio",
        type=float,
        default=0.08,
        help="Ignore tiny disconnected fragments below this fraction of the median component face count.",
    )
    args = ap.parse_args()

    source = args.input_stl.resolve()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    parts_dir = output / "components"
    parts_dir.mkdir(parents=True, exist_ok=True)

    print(f"SOURCE={source}")
    print(f"SOURCE_EXISTS={source.exists()}")
    print(f"OUTPUT={output}")

    if not source.exists() or not source.is_file():
        print("ERROR=INPUT_STL_NOT_FOUND")
        print("GAUNTLET_COMBINED_STL=FAIL")
        return 2

    try:
        mesh = load_mesh(source)
    except Exception as exc:
        print(f"ERROR=LOAD_FAILED:{type(exc).__name__}:{exc}")
        print("GAUNTLET_COMBINED_STL=FAIL")
        return 3

    finite = finite_mesh(mesh)
    print(f"VERTICES={len(mesh.vertices)}")
    print(f"FACES={len(mesh.faces)}")
    print(f"FINITE_GEOMETRY={finite}")
    print(f"WATERTIGHT={bool(mesh.is_watertight)}")
    print(f"BOUNDS={np.asarray(mesh.bounds).round(4).tolist() if mesh.bounds is not None else None}")
    print(f"EXTENTS={np.asarray(mesh.extents).round(4).tolist()}")

    if not finite:
        print("GAUNTLET_COMBINED_STL=FAIL_NONFINITE")
        return 4

    # Split by actual mesh connectivity. This preserves each component's original world position.
    components = list(mesh.split(only_watertight=False))
    components.sort(key=lambda m: len(m.faces), reverse=True)
    print(f"RAW_COMPONENTS={len(components)}")

    face_counts = np.asarray([len(c.faces) for c in components], dtype=np.int64)
    median_faces = float(np.median(face_counts)) if len(face_counts) else 0.0
    threshold = max(4, int(round(median_faces * args.min_face_ratio))) if median_faces else 4
    plausible = [c for c in components if len(c.faces) >= threshold and finite_mesh(c)]
    tiny = [c for c in components if len(c.faces) < threshold]

    print(f"MEDIAN_COMPONENT_FACES={median_faces:.1f}")
    print(f"MIN_PLAUSIBLE_FACES={threshold}")
    print(f"PLAUSIBLE_COMPONENTS={len(plausible)}")
    print(f"TINY_COMPONENTS={len(tiny)}")

    manifest_parts: list[dict] = []
    scene = trimesh.Scene()

    # Export in stable order for inspection. We deliberately do NOT assign FDI yet.
    # FDI mapping will be derived only after the visual/positional Gauntlet passes.
    for idx, part in enumerate(plausible, start=1):
        name = f"Component_{idx:02d}"
        centroid = np.asarray(part.centroid, dtype=float)
        bounds = np.asarray(part.bounds, dtype=float)
        extents = np.asarray(part.extents, dtype=float)
        item = {
            "name": name,
            "vertices": int(len(part.vertices)),
            "faces": int(len(part.faces)),
            "watertight": bool(part.is_watertight),
            "finite": finite_mesh(part),
            "centroid": centroid.round(5).tolist(),
            "bounds": bounds.round(5).tolist(),
            "extents": extents.round(5).tolist(),
        }
        manifest_parts.append(item)
        part.export(parts_dir / f"{name}.ply")
        scene.add_geometry(part.copy(), node_name=name, geom_name=name)
        print(
            f"PART={name} V={item['vertices']} F={item['faces']} "
            f"CENTROID={[round(x, 3) for x in centroid.tolist()]} "
            f"EXT={[round(x, 3) for x in extents.tolist()]}"
        )

    glb_path = output / "combined_components_preview.glb"
    if plausible:
        glb_bytes = scene.export(file_type="glb")
        glb_path.write_bytes(glb_bytes)
        print(f"PREVIEW_GLB={glb_path}")
        print(f"PREVIEW_GLB_BYTES={len(glb_bytes)}")

    payload = {
        "source": str(source),
        "sourceVertices": int(len(mesh.vertices)),
        "sourceFaces": int(len(mesh.faces)),
        "finiteGeometry": finite,
        "rawComponents": len(components),
        "medianComponentFaces": median_faces,
        "minimumPlausibleFaces": threshold,
        "plausibleComponents": len(plausible),
        "tinyComponents": len(tiny),
        "parts": manifest_parts,
        "previewGlb": str(glb_path),
    }
    manifest_path = output / "manifest.json"
    manifest_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"MANIFEST={manifest_path}")
    print(f"MANIFEST_EXISTS={manifest_path.exists()}")

    if len(plausible) == 32 and glb_path.exists() and glb_path.stat().st_size > 0:
        print("GAUNTLET_32_CONNECTED_COMPONENTS=PASS")
        print("GAUNTLET_COMBINED_STL=PASS")
        return 0

    if len(plausible) in (16, 28, 30, 31, 33, 34):
        print(f"GAUNTLET_32_CONNECTED_COMPONENTS=REVIEW:{len(plausible)}/32")
    else:
        print(f"GAUNTLET_32_CONNECTED_COMPONENTS=FAIL:{len(plausible)}/32")
    print("GAUNTLET_COMBINED_STL=REVIEW")
    return 1


if __name__ == "__main__":
    sys.exit(main())
