from __future__ import annotations

import argparse
import json
import shutil
import tempfile
from pathlib import Path

import numpy as np
import pymeshlab
import trimesh


def load_with_meshlab(eoff_path: Path) -> trimesh.Trimesh:
    with tempfile.TemporaryDirectory(prefix="eoff_meshlab_") as tmp:
        tmp_off = Path(tmp) / (eoff_path.stem + ".off")
        shutil.copy2(eoff_path, tmp_off)

        ms = pymeshlab.MeshSet()
        ms.load_new_mesh(str(tmp_off))
        mesh = ms.current_mesh()
        vertices = np.asarray(mesh.vertex_matrix(), dtype=np.float64)
        faces = np.asarray(mesh.face_matrix(), dtype=np.int64)

    if vertices.ndim != 2 or vertices.shape[1] != 3 or len(vertices) < 3:
        raise RuntimeError(f"invalid vertex matrix shape {vertices.shape}")
    if faces.ndim != 2 or faces.shape[1] != 3 or len(faces) < 1:
        raise RuntimeError(f"invalid face matrix shape {faces.shape}")
    if not np.isfinite(vertices).all():
        raise RuntimeError("NaN/Infinity in vertices")
    if faces.min() < 0 or faces.max() >= len(vertices):
        raise RuntimeError("face index out of range")

    tm = trimesh.Trimesh(vertices=vertices, faces=faces, process=False, validate=False)
    return tm


def main() -> int:
    ap = argparse.ArgumentParser(description="Gauntlet: use MeshLab's OFF importer to convert Exocad EOFF templates")
    ap.add_argument("input_dir", type=Path)
    ap.add_argument("--output", type=Path, default=Path("output/meshlab-eoff"))
    args = ap.parse_args()

    source = args.input_dir
    output = args.output
    output.mkdir(parents=True, exist_ok=True)
    ply_dir = output / "ply"
    ply_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(source.rglob("*.eoff"), key=lambda p: (p.parent.name.lower(), int(p.stem) if p.stem.isdigit() else 999, p.name))
    print(f"EOFF_FILES={len(files)}")
    if not files:
        print("GAUNTLET_MESHLAB_EOFF=FAIL")
        return 2

    scene = trimesh.Scene()
    report = []
    failures = []

    for idx, path in enumerate(files):
        jaw = path.parent.name.lower()
        pos = int(path.stem) if path.stem.isdigit() else idx + 1
        name = f"{jaw}_{pos}"
        try:
            mesh = load_with_meshlab(path)
            mesh.metadata["name"] = name
            mesh.export(ply_dir / f"{name}.ply")

            preview = mesh.copy()
            preview.apply_translation(-preview.centroid)
            row = 0 if "upper" in jaw else 1
            col = (pos - 1) if 1 <= pos <= 8 else idx % 8
            spacing_x = max(float(preview.extents[0]), 10.0) * 1.6
            preview.apply_translation([col * spacing_x, -row * 22.0, 0.0])
            scene.add_geometry(preview, node_name=name, geom_name=name)

            components = int(len(mesh.split(only_watertight=False)))
            item = {
                "name": name,
                "file": str(path),
                "vertices": int(len(mesh.vertices)),
                "faces": int(len(mesh.faces)),
                "finite": bool(np.isfinite(mesh.vertices).all()),
                "components": components,
                "bounds": mesh.bounds.tolist(),
                "extents": mesh.extents.tolist(),
            }
            report.append(item)
            print(f"PASS={name} V={item['vertices']} F={item['faces']} COMP={components} FINITE={item['finite']}")
        except Exception as exc:
            failures.append({"file": str(path), "error": str(exc)})
            print(f"FAIL={path}:{exc}")

    glb_path = output / "meshlab_templates_preview.glb"
    if report:
        glb_path.write_bytes(scene.export(file_type="glb"))

    payload = {
        "source": str(source),
        "eoff_files": len(files),
        "converted": len(report),
        "failures": failures,
        "meshes": report,
        "preview_glb": str(glb_path),
    }
    (output / "manifest.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    all_finite = bool(report) and all(x["finite"] for x in report)
    sane_components = bool(report) and all(x["components"] <= 8 for x in report)

    print(f"CONVERTED={len(report)}")
    print(f"FAILURES={len(failures)}")
    print(f"FINITE_GEOMETRY={all_finite}")
    print(f"SANE_COMPONENTS={sane_components}")
    print(f"PREVIEW_GLB={glb_path}")

    if len(files) == 16 and len(report) == 16 and not failures and all_finite and sane_components and glb_path.exists() and glb_path.stat().st_size > 0:
        print("GAUNTLET_MESHLAB_EOFF=PASS")
        return 0

    print("GAUNTLET_MESHLAB_EOFF=REVIEW")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
