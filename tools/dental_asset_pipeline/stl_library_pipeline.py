from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
import trimesh

VALID_FDI = {
    *(str(q * 10 + p) for q in (1, 2, 3, 4) for p in range(1, 9)),
}


def _finite_array(values: np.ndarray) -> bool:
    return bool(np.isfinite(values).all())


def _sanitize_name(name: str) -> str:
    clean = re.sub(r"[^A-Za-z0-9_\-]+", "_", name.strip())
    return clean.strip("_") or "mesh"


def _infer_fdi(text: str) -> str | None:
    # Only accept an isolated 2-digit FDI code so numbers from version names,
    # dimensions, etc. do not accidentally become tooth identifiers.
    for match in re.finditer(r"(?<!\d)([1-4][1-8])(?!\d)", text):
        code = match.group(1)
        if code in VALID_FDI:
            return code
    return None


def _load_as_mesh(path: Path) -> trimesh.Trimesh:
    loaded = trimesh.load(path, process=False)

    if isinstance(loaded, trimesh.Scene):
        geometries = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
        if not geometries:
            raise ValueError("scene contains no triangle meshes")
        return trimesh.util.concatenate(geometries)

    if not isinstance(loaded, trimesh.Trimesh):
        raise TypeError(f"unsupported mesh type: {type(loaded).__name__}")

    return loaded


def scan_library(input_dir: Path, output_dir: Path | None = None) -> int:
    input_dir = input_dir.resolve()
    if not input_dir.exists() or not input_dir.is_dir():
        print(f"ERROR=INPUT_DIRECTORY_NOT_FOUND:{input_dir}")
        print("GAUNTLET_STL_SCAN=FAIL")
        return 2

    stl_files = sorted(p for p in input_dir.rglob("*") if p.is_file() and p.suffix.lower() == ".stl")
    print(f"INPUT_DIR={input_dir}")
    print(f"STL_FILES={len(stl_files)}")

    if not stl_files:
        print("ERROR=NO_STL_FILES")
        print("GAUNTLET_STL_SCAN=FAIL")
        return 3

    records: list[dict] = []
    failures: list[dict] = []
    inferred_fdi: dict[str, str] = {}
    scene = trimesh.Scene()

    for idx, path in enumerate(stl_files, start=1):
        rel = path.relative_to(input_dir)
        try:
            mesh = _load_as_mesh(path)
            vertices = np.asarray(mesh.vertices)
            faces = np.asarray(mesh.faces)
            finite = _finite_array(vertices) and _finite_array(faces)
            bounds_finite = mesh.bounds is not None and _finite_array(np.asarray(mesh.bounds))
            components = mesh.split(only_watertight=False)
            fdi = _infer_fdi(path.stem)

            if fdi and fdi not in inferred_fdi:
                inferred_fdi[fdi] = str(rel)

            record = {
                "file": str(rel),
                "vertices": int(len(vertices)),
                "faces": int(len(faces)),
                "finite": finite,
                "boundsFinite": bounds_finite,
                "connectedComponents": int(len(components)),
                "watertight": bool(mesh.is_watertight),
                "inferredFDI": fdi,
                "bounds": np.asarray(mesh.bounds).round(5).tolist() if mesh.bounds is not None else None,
            }
            records.append(record)

            node_name = f"Tooth_{fdi}" if fdi else f"Asset_{idx:02d}_{_sanitize_name(path.stem)}"
            scene.add_geometry(mesh.copy(), node_name=node_name, geom_name=node_name)

            print(
                f"FILE={rel} | V={record['vertices']} | F={record['faces']} | "
                f"COMP={record['connectedComponents']} | FINITE={finite} | FDI={fdi or '-'}"
            )
        except Exception as exc:  # noqa: BLE001 - diagnostic pipeline intentionally captures all file failures
            failures.append({"file": str(rel), "error": f"{type(exc).__name__}: {exc}"})
            print(f"FAILURE={rel}:{type(exc).__name__}:{exc}")

    finite_geometry = bool(records) and all(r["finite"] and r["boundsFinite"] for r in records)
    missing_fdi = sorted(VALID_FDI - set(inferred_fdi), key=int)

    print(f"LOADED_MESHES={len(records)}")
    print(f"FAILURES={len(failures)}")
    print(f"FINITE_GEOMETRY={finite_geometry}")
    print(f"INFERRED_FDI_COUNT={len(inferred_fdi)}")
    print(f"INFERRED_FDI={','.join(sorted(inferred_fdi, key=int)) if inferred_fdi else '-'}")
    print(f"MISSING_FDI={','.join(missing_fdi) if missing_fdi else '-'}")

    manifest = {
        "sourceDirectory": str(input_dir),
        "stlFileCount": len(stl_files),
        "loadedMeshCount": len(records),
        "finiteGeometry": finite_geometry,
        "inferredFDI": inferred_fdi,
        "missingFDI": missing_fdi,
        "records": records,
        "failures": failures,
    }

    if output_dir is not None:
        output_dir = output_dir.resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
        manifest_path = output_dir / "stl_library_manifest.json"
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"MANIFEST={manifest_path}")

        if records and not failures and finite_geometry:
            glb_path = output_dir / "library_raw.glb"
            glb_bytes = scene.export(file_type="glb")
            glb_path.write_bytes(glb_bytes)
            print(f"GLB={glb_path}")
            print(f"GLB_BYTES={len(glb_bytes)}")

    # This first gate does NOT require FDI names yet: many libraries use proprietary
    # tooth names. We only require a plausible adult library and clean geometry.
    pass_gate = len(records) >= 28 and not failures and finite_geometry
    print(f"GAUNTLET_STL_SCAN={'PASS' if pass_gate else 'REVIEW'}")

    if len(records) == 32:
        print("GAUNTLET_32_FILES=PASS")
    else:
        print(f"GAUNTLET_32_FILES=REVIEW:{len(records)}/32")

    return 0 if pass_gate else 4


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inspect a free STL tooth library before integrating it into Dental Care."
    )
    parser.add_argument("input_dir", type=Path, help="Folder containing STL files (recursive scan).")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional output folder for manifest.json and a raw combined GLB.",
    )
    args = parser.parse_args()
    return scan_library(args.input_dir, args.output)


if __name__ == "__main__":
    sys.exit(main())
