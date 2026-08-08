from __future__ import annotations

import argparse
import struct
from pathlib import Path

import numpy as np
import trimesh


class ProbeError(RuntimeError):
    pass


def read_header(data: bytes):
    nl = data.find(b"\n")
    if nl < 0:
        raise ProbeError("missing OFF BINARY newline")
    header = data[:nl].decode("ascii", errors="replace").strip()
    if not header.startswith("OFF BINARY"):
        raise ProbeError(f"unexpected header {header!r}")
    counts_offset = nl + 1
    little = struct.unpack_from("<iii", data, counts_offset)
    big = struct.unpack_from(">iii", data, counts_offset)

    def score(c):
        v, f, e = c
        if not (0 < v < 2_000_000 and 0 < f < 4_000_000 and 0 <= e < 8_000_000):
            return -999
        s = 0
        if f >= v:
            s += 2
        if f and abs(e - 1.5 * f) / f < 0.25:
            s += 4
        return s

    endian, counts = max((("<", little), (">", big)), key=lambda item: score(item[1]))
    return counts_offset + 12, endian, counts


def read_vertices_stride32(data: bytes, vertex_offset: int, vertex_count: int, endian: str):
    stride = 32
    end = vertex_offset + vertex_count * stride
    if end > len(data):
        raise ProbeError("vertex block exceeds file")
    raw = np.frombuffer(data, dtype=np.uint8, count=vertex_count * stride, offset=vertex_offset).reshape(vertex_count, stride)
    vertices = np.frombuffer(raw[:, :12].copy().tobytes(), dtype=np.dtype(f"{endian}f4")).reshape(vertex_count, 3).astype(np.float64)
    if not np.isfinite(vertices).all():
        raise ProbeError("non-finite vertices")
    return vertices, end


def triangle_rows(data: bytes, offset: int, endian: str):
    available_bytes = len(data) - offset
    count = max(0, available_bytes // 6)
    if count == 0:
        return np.empty((0, 3), dtype=np.uint16), available_bytes
    dtype = np.dtype(f"{endian}u2")
    arr = np.frombuffer(data, dtype=dtype, count=count * 3, offset=offset).reshape(count, 3)
    return arr, available_bytes % 6


def valid_prefix_length(tris: np.ndarray, vertex_count: int) -> int:
    if len(tris) == 0:
        return 0
    valid = np.all(tris < vertex_count, axis=1)
    bad = np.flatnonzero(~valid)
    return int(bad[0]) if bad.size else int(len(tris))


def score_offset(data: bytes, offset: int, endian: str, vertex_count: int, header_faces: int):
    tris, remainder = triangle_rows(data, offset, endian)
    prefix = valid_prefix_length(tris, vertex_count)
    usable = tris[: min(prefix, header_faces)]
    if len(usable):
        degenerate = np.any(
            np.stack((usable[:, 0] == usable[:, 1], usable[:, 1] == usable[:, 2], usable[:, 0] == usable[:, 2]), axis=1),
            axis=1,
        )
        degenerate_ratio = float(np.mean(degenerate))
    else:
        degenerate_ratio = 1.0
    return prefix, remainder, degenerate_ratio, len(tris)


def main() -> int:
    ap = argparse.ArgumentParser(description="Full Gauntlet validation for Exocad EOFF u16 triangle layout")
    ap.add_argument("input", type=Path)
    args = ap.parse_args()

    path = args.input
    data = path.read_bytes()
    vertex_offset, endian, (v, f, e) = read_header(data)
    vertices, canonical_face_offset = read_vertices_stride32(data, vertex_offset, v, endian)

    print(f"FILE={path}")
    print(f"BYTES={len(data)} ENDIAN={'little' if endian == '<' else 'big'} V={v} F_HEADER={f} E={e}")
    print(f"VERTEX_STRIDE=32 FACE_OFFSET_CANONICAL={canonical_face_offset}")

    prefix, remainder, deg_ratio, slots = score_offset(data, canonical_face_offset, endian, v, f)
    print(
        f"CANONICAL_VALID_PREFIX={prefix} AVAILABLE_TRI_SLOTS={slots} "
        f"HEADER_COVERAGE={prefix / f:.6f} REMAINDER_BYTES={remainder} DEGENERATE_RATIO={deg_ratio:.6f}"
    )

    # If the header face count and the byte stream disagree slightly, search a
    # narrow neighbourhood around the canonical end of the 32-byte vertex block.
    # This does not mutate data; it tells us whether the successful sample was a
    # real face stream or an accidental alignment.
    best = None
    search_start = max(vertex_offset + v * 12, canonical_face_offset - 1024)
    search_end = min(len(data) - 6, canonical_face_offset + 128)
    for off in range(search_start, search_end + 1, 2):
        pfx, rem, dr, nslots = score_offset(data, off, endian, v, f)
        # Prefer long valid prefixes, then low degeneracy, then proximity to the
        # canonical vertex boundary.
        candidate = (pfx, -dr, -abs(off - canonical_face_offset), off, rem, nslots, dr)
        if best is None or candidate[:3] > best[:3]:
            best = candidate

    assert best is not None
    best_prefix, _, _, best_offset, best_remainder, best_slots, best_deg_ratio = best
    print(
        f"BEST_OFFSET={best_offset} OFFSET_DELTA={best_offset - canonical_face_offset} "
        f"BEST_VALID_PREFIX={best_prefix} BEST_AVAILABLE_SLOTS={best_slots} "
        f"BEST_COVERAGE={best_prefix / f:.6f} BEST_REMAINDER={best_remainder} "
        f"BEST_DEGENERATE_RATIO={best_deg_ratio:.6f}"
    )

    tris_all, _ = triangle_rows(data, best_offset, endian)
    use_count = min(best_prefix, f)
    faces = tris_all[:use_count].astype(np.int64, copy=False)
    faces = faces[
        (faces[:, 0] != faces[:, 1])
        & (faces[:, 1] != faces[:, 2])
        & (faces[:, 0] != faces[:, 2])
    ]

    mesh_ok = False
    components = -1
    bounds_finite = False
    if len(faces) >= 1000:
        mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False, validate=False)
        bounds_finite = bool(np.isfinite(mesh.bounds).all())
        try:
            components = len(mesh.split(only_watertight=False))
        except Exception:
            components = -1
        mesh_ok = bounds_finite and len(mesh.faces) >= 1000

    print(f"MESH_FACES={len(faces)} BOUNDS_FINITE={bounds_finite} COMPONENTS={components}")

    # Strong enough for the next converter iteration: almost all header faces
    # validate as u16 triangles, geometry is finite, and accidental degeneracy is
    # very low. We intentionally do not require exact F_HEADER equality because
    # Exocad templates may include bookkeeping/deleted faces in the header.
    coverage = best_prefix / f if f else 0.0
    passed = (
        endian == "<"
        and coverage >= 0.97
        and best_deg_ratio <= 0.02
        and mesh_ok
    )

    print(f"GAUNTLET_U16_TRIANGLE_LAYOUT={'PASS' if passed else 'REVIEW'}")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
