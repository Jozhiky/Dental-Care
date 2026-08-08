from __future__ import annotations

import argparse
import json
import math
import tempfile
from pathlib import Path
from typing import Iterable

import numpy as np
import SimpleITK as sitk
import trimesh
from skimage import measure

FDI_IDS = [
    11, 12, 13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
]

FDI_NAMES = {
    11: "Upper Right Central Incisor", 12: "Upper Right Lateral Incisor",
    13: "Upper Right Canine", 14: "Upper Right First Premolar",
    15: "Upper Right Second Premolar", 16: "Upper Right First Molar",
    17: "Upper Right Second Molar", 18: "Upper Right Third Molar",
    21: "Upper Left Central Incisor", 22: "Upper Left Lateral Incisor",
    23: "Upper Left Canine", 24: "Upper Left First Premolar",
    25: "Upper Left Second Premolar", 26: "Upper Left First Molar",
    27: "Upper Left Second Molar", 28: "Upper Left Third Molar",
    31: "Lower Left Central Incisor", 32: "Lower Left Lateral Incisor",
    33: "Lower Left Canine", 34: "Lower Left First Premolar",
    35: "Lower Left Second Premolar", 36: "Lower Left First Molar",
    37: "Lower Left Second Molar", 38: "Lower Left Third Molar",
    41: "Lower Right Central Incisor", 42: "Lower Right Lateral Incisor",
    43: "Lower Right Canine", 44: "Lower Right First Premolar",
    45: "Lower Right Second Premolar", 46: "Lower Right First Molar",
    47: "Lower Right Second Molar", 48: "Lower Right Third Molar",
}


def label_files(folder: Path, set_b_only: bool = True) -> list[Path]:
    files = sorted({*folder.rglob("*.mha"), *folder.rglob("*.nii.gz")})
    if set_b_only:
        preferred = [p for p in files if "F_" in p.name.upper() or "F-" in p.name.upper()]
        if preferred:
            files = preferred
    return files


def load_label(path: Path) -> tuple[sitk.Image, np.ndarray]:
    image = sitk.ReadImage(str(path))
    array = sitk.GetArrayFromImage(image)
    if array.ndim != 3:
        raise ValueError(f"Expected a 3D label volume, got shape {array.shape} from {path}")
    return image, array


def present_fdi_ids(array: np.ndarray, minimum_voxels: int = 50) -> list[int]:
    present: list[int] = []
    for fdi in FDI_IDS:
        if int(np.count_nonzero(array == fdi)) >= minimum_voxels:
            present.append(fdi)
    return present


def scan_cases(folder: Path, set_b_only: bool, minimum_voxels: int) -> int:
    files = label_files(folder, set_b_only=set_b_only)
    if not files:
        print(f"GAUNTLET_SCAN=FAIL\nNo .mha or .nii.gz label files found in: {folder}")
        return 2

    rows: list[dict] = []
    for index, path in enumerate(files, start=1):
        _, array = load_label(path)
        present = present_fdi_ids(array, minimum_voxels=minimum_voxels)
        rows.append({
            "path": str(path),
            "count": len(present),
            "present": present,
            "missing": [fdi for fdi in FDI_IDS if fdi not in present],
        })
        print(f"[{index:02d}/{len(files):02d}] {path.name}: {len(present)}/32 teeth")

    rows.sort(key=lambda row: row["count"], reverse=True)
    best = rows[0]
    print("\n=== GAUNTLET G2: BEST CASE ===")
    print(f"BEST_LABEL={best['path']}")
    print(f"FDI_COUNT={best['count']}")
    print(f"MISSING={best['missing']}")
    print("GAUNTLET_SCAN=PASS" if best["count"] >= 28 else "GAUNTLET_SCAN=REVIEW")
    return 0


def mask_to_mesh(mask: np.ndarray, spacing_xyz: tuple[float, float, float]) -> trimesh.Trimesh:
    spacing_zyx = (spacing_xyz[2], spacing_xyz[1], spacing_xyz[0])
    verts_zyx, faces, _, _ = measure.marching_cubes(
        mask.astype(np.uint8),
        level=0.5,
        spacing=spacing_zyx,
        allow_degenerate=False,
    )
    vertices_xyz = verts_zyx[:, [2, 1, 0]]
    mesh = trimesh.Trimesh(vertices=vertices_xyz, faces=faces, process=True)
    mesh.remove_unreferenced_vertices()
    trimesh.repair.fix_normals(mesh)
    return mesh


def mesh_is_finite(mesh: trimesh.Trimesh) -> bool:
    return bool(
        len(mesh.vertices) > 0
        and len(mesh.faces) > 0
        and np.isfinite(mesh.vertices).all()
        and np.isfinite(mesh.bounds).all()
    )


def extract_label_file(
    label_path: Path,
    output_dir: Path,
    minimum_voxels: int = 50,
) -> dict:
    image, array = load_label(label_path)
    spacing = tuple(float(v) for v in image.GetSpacing())
    output_dir.mkdir(parents=True, exist_ok=True)
    teeth_dir = output_dir / "teeth"
    teeth_dir.mkdir(parents=True, exist_ok=True)

    meshes: dict[int, trimesh.Trimesh] = {}
    source_voxels: dict[int, int] = {}
    failures: list[dict] = []

    for fdi in FDI_IDS:
        voxel_count = int(np.count_nonzero(array == fdi))
        source_voxels[fdi] = voxel_count
        if voxel_count < minimum_voxels:
            continue

        try:
            mesh = mask_to_mesh(array == fdi, spacing)
        except Exception as exc:  # keep the Gauntlet report explicit
            failures.append({"fdi": fdi, "error": str(exc)})
            continue

        if not mesh_is_finite(mesh):
            failures.append({"fdi": fdi, "error": "non-finite or empty mesh"})
            continue

        meshes[fdi] = mesh

    if not meshes:
        raise RuntimeError("No valid tooth meshes were extracted.")

    # Center every piece with the SAME transform, preserving the patient's arch.
    all_bounds = np.vstack([mesh.bounds for mesh in meshes.values()])
    global_min = all_bounds.min(axis=0)
    global_max = all_bounds.max(axis=0)
    global_center = (global_min + global_max) * 0.5

    scene = trimesh.Scene()
    manifest_teeth: list[dict] = []

    for fdi, mesh in sorted(meshes.items()):
        mesh.apply_translation(-global_center)
        name = f"Tooth_{fdi}"
        mesh.metadata["name"] = name
        mesh.export(teeth_dir / f"{name}.ply")
        scene.add_geometry(mesh, geom_name=name, node_name=name)

        manifest_teeth.append({
            "fdi": fdi,
            "name": FDI_NAMES[fdi],
            "node": name,
            "vertices": int(len(mesh.vertices)),
            "faces": int(len(mesh.faces)),
            "sourceVoxels": source_voxels[fdi],
            "boundsFinite": mesh_is_finite(mesh),
        })

    glb_bytes = scene.export(file_type="glb")
    glb_path = output_dir / "dentition_raw.glb"
    glb_path.write_bytes(glb_bytes)

    present = sorted(meshes.keys())
    missing = [fdi for fdi in FDI_IDS if fdi not in present]
    total_vertices = sum(item["vertices"] for item in manifest_teeth)
    total_faces = sum(item["faces"] for item in manifest_teeth)

    manifest = {
        "source": str(label_path),
        "sourceLicense": "ToothFairy2: CC BY-SA 4.0 (verify attribution/share-alike requirements before distribution)",
        "coordinateStrategy": "voxel physical spacing, XYZ centered globally; source direction intentionally not applied",
        "spacingXYZ": spacing,
        "teethExpected": 32,
        "teethExtracted": len(present),
        "presentFDI": present,
        "missingFDI": missing,
        "failures": failures,
        "totalVertices": total_vertices,
        "totalFaces": total_faces,
        "glb": glb_path.name,
        "teeth": manifest_teeth,
    }
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    finite = all(item["boundsFinite"] for item in manifest_teeth)
    print("\n=== GAUNTLET G3: RAW FDI EXTRACTION ===")
    print(f"SOURCE={label_path}")
    print(f"EXTRACTED={len(present)}/32")
    print(f"MISSING={missing}")
    print(f"FAILURES={failures}")
    print(f"FINITE_GEOMETRY={finite}")
    print(f"TOTAL_VERTICES={total_vertices}")
    print(f"TOTAL_FACES={total_faces}")
    print(f"GLB={glb_path}")

    pass_condition = len(present) >= 28 and finite and not failures and glb_path.stat().st_size > 0
    print("GAUNTLET_EXTRACT=PASS" if pass_condition else "GAUNTLET_EXTRACT=REVIEW")
    return manifest


def make_synthetic_label(path: Path) -> None:
    shape = (64, 64, 64)  # z, y, x
    volume = np.zeros(shape, dtype=np.uint8)
    zz, yy, xx = np.indices(shape)
    spheres = [
        (11, (30, 36, 22)),
        (12, (30, 36, 30)),
        (21, (30, 36, 38)),
        (22, (30, 36, 46)),
    ]
    for label, (cz, cy, cx) in spheres:
        radius = 4.5
        mask = (zz - cz) ** 2 + (yy - cy) ** 2 + (xx - cx) ** 2 <= radius ** 2
        volume[mask] = label

    image = sitk.GetImageFromArray(volume)
    image.SetSpacing((0.3, 0.3, 0.3))
    sitk.WriteImage(image, str(path))


def selftest() -> int:
    print("=== GAUNTLET G1: PIPELINE SELFTEST ===")
    with tempfile.TemporaryDirectory(prefix="dental_asset_gauntlet_") as tmp:
        tmp_path = Path(tmp)
        label_path = tmp_path / "synthetic_labels.mha"
        output_dir = tmp_path / "output"
        make_synthetic_label(label_path)
        manifest = extract_label_file(label_path, output_dir, minimum_voxels=10)

        expected = {11, 12, 21, 22}
        actual = set(manifest["presentFDI"])
        glb_exists = (output_dir / "dentition_raw.glb").exists()
        finite = all(item["boundsFinite"] for item in manifest["teeth"])

        checks = {
            "expectedSyntheticFDI": actual == expected,
            "glbCreated": glb_exists,
            "finiteGeometry": finite,
            "noFailures": not manifest["failures"],
        }
        for key, value in checks.items():
            print(f"{key}={value}")

        passed = all(checks.values())
        print("GAUNTLET_SELFTEST=PASS" if passed else "GAUNTLET_SELFTEST=FAIL")
        return 0 if passed else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Free dental asset pipeline: ToothFairy2 labels -> individual FDI meshes -> GLB",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("selftest", help="Run a synthetic 4-tooth extraction test; no dataset required")

    scan = sub.add_parser("scan", help="Find the ToothFairy2 case with the most FDI teeth")
    scan.add_argument("labels_dir", type=Path)
    scan.add_argument("--all-sets", action="store_true", help="Scan P and F sets; default prefers F (full field of view)")
    scan.add_argument("--minimum-voxels", type=int, default=50)

    extract = sub.add_parser("extract", help="Extract individual FDI meshes and a combined GLB")
    extract.add_argument("label_file", type=Path)
    extract.add_argument("output_dir", type=Path)
    extract.add_argument("--minimum-voxels", type=int, default=50)

    return parser


def main() -> int:
    args = build_parser().parse_args()

    if args.command == "selftest":
        return selftest()
    if args.command == "scan":
        return scan_cases(
            args.labels_dir,
            set_b_only=not args.all_sets,
            minimum_voxels=args.minimum_voxels,
        )
    if args.command == "extract":
        extract_label_file(args.label_file, args.output_dir, minimum_voxels=args.minimum_voxels)
        return 0

    raise AssertionError("unreachable")


if __name__ == "__main__":
    raise SystemExit(main())
