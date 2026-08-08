# Dental Asset Pipeline — Free Gauntlet

Goal: replace the procedural tooth blocks with meshes extracted from a real, publicly available CBCT segmentation dataset.

## Source chosen

**ToothFairy2** (training set). It provides voxel-level labels aligned to FDI tooth identifiers 11–18, 21–28, 31–38, and 41–48. The public training dataset is licensed CC BY-SA 4.0 and requires account sign-in to download.

Why ToothFairy2 instead of ToothFairy3 for the master asset: ToothFairy3 is newer and richer, but its public training set is CC-BY-NC-SA, which is not suitable as the default source for a project that may later have commercial use. Review licensing obligations before distributing any derived asset.

## Gauntlet phases

- **G0 — Source/legal:** verify dataset, FDI labels, and license.
- **G1 — Pipeline self-test:** synthetic labels -> four independent tooth meshes -> GLB. No dataset required.
- **G2 — Case selection:** scan Set B (`F_` cases) and choose the case with the most FDI teeth.
- **G3 — Raw extraction:** create `Tooth_XX.ply`, `dentition_raw.glb`, and `manifest.json`.
- **G4 — Web import:** load the GLB with Three.js `GLTFLoader` without removing the current procedural fallback.
- **G5 — FDI interaction:** verify click selection and exact mesh/node names.
- **G6 — Optimization:** only after G5 passes, simplify/smooth meshes for web performance.
- **G7 — Gingiva:** add a separate gingival asset after the teeth pass anatomy/interaction checks.

No phase may be declared PASS based only on compilation. The visible browser result, console, and manifest must agree.

## Setup

From the repository root:

```powershell
cd tools\dental_asset_pipeline
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `py` is unavailable, use `python` instead.

## G1 — self-test

```powershell
python toothfairy2_pipeline.py selftest
```

Expected final line:

```text
GAUNTLET_SELFTEST=PASS
```

Do not download or process the medical dataset until this passes.

## G2 — choose a case

After downloading and extracting ToothFairy2, point the command to its `labelsTr` folder:

```powershell
python toothfairy2_pipeline.py scan "C:\RUTA\ToothFairy2\labelsTr"
```

The scanner prefers Set B (`F_`) cases because those have the broader field of view with complete upper teeth segmentation.

Expected output includes:

```text
BEST_LABEL=...
FDI_COUNT=...
MISSING=[...]
GAUNTLET_SCAN=PASS
```

## G3 — extract the selected case

Copy the `BEST_LABEL` path and run:

```powershell
python toothfairy2_pipeline.py extract "C:\RUTA\labelsTr\ToothFairy2F_XXX.mha" "output\candidate-01"
```

Outputs:

```text
output/candidate-01/
  dentition_raw.glb
  manifest.json
  teeth/
    Tooth_11.ply
    Tooth_12.ply
    ...
```

For the first raw asset we deliberately do **not** smooth, sculpt, decimate, or invent missing teeth. G3 validates only anatomical source extraction and numerical integrity.

## Pass criteria for G3

- At least 28 FDI teeth extracted from one real Set B case.
- Prefer 32/32; if no case has 32, missing pieces are documented rather than invented.
- No NaN/Infinity in mesh vertices/bounds.
- No extraction failures.
- GLB file is non-empty.
- Node names use `Tooth_XX`.

The next phase integrates `dentition_raw.glb` into the React/Three.js viewer while preserving the current procedural version as a fallback until the asset passes visually.
