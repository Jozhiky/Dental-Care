from __future__ import annotations

import argparse
import struct
from pathlib import Path

import numpy as np


class ProbeError(RuntimeError):
    pass


def read_header(data: bytes):
    nl = data.find(b"\n")
    if nl < 0:
        raise ProbeError("missing OFF BINARY newline")
    header = data[:nl].decode("ascii", errors="replace").strip()
    if not header.startswith("OFF BINARY"):
        raise ProbeError(f"unexpected header {header!r}")
    base = nl + 1
    little = struct.unpack_from("<iii", data, base)
    big = struct.unpack_from(">iii", data, base)
    # Exocad files observed so far are little-endian and have E ~= 3F/2.
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
    return base + 12, endian, counts


def positions_for_stride(data: bytes, vertex_offset: int, vertex_count: int, stride: int, endian: str):
    end = vertex_offset + vertex_count * stride
    if end > len(data):
        return None
    raw = np.frombuffer(data, dtype=np.uint8, count=vertex_count * stride, offset=vertex_offset)
    raw = raw.reshape(vertex_count, stride)
    # First 12 bytes are tested as xyz float32; extra bytes may be normals/metadata.
    xyz = np.frombuffer(raw[:, :12].copy().tobytes(), dtype=np.dtype(f"{endian}f4")).reshape(vertex_count, 3)
    if not np.isfinite(xyz).all():
        return None
    ext = np.ptp(xyz, axis=0)
    max_abs = float(np.max(np.abs(xyz))) if xyz.size else 0.0
    plausible = bool(np.all(ext > 1e-6) and max_abs < 10000)
    return xyz, plausible, ext.tolist(), max_abs, end


def check_faces_u16_counted(data: bytes, offset: int, face_count: int, vertex_count: int, endian: str, sample=256):
    cursor = offset
    fmt = f"{endian}H"
    ok = 0
    for _ in range(min(face_count, sample)):
        if cursor + 2 > len(data):
            return False, ok, "eof-count"
        n = struct.unpack_from(fmt, data, cursor)[0]
        cursor += 2
        if n < 3 or n > 16:
            return False, ok, f"bad-n={n}"
        need = n * 2
        if cursor + need > len(data):
            return False, ok, "eof-indices"
        inds = struct.unpack_from(f"{endian}{n}H", data, cursor)
        cursor += need
        if max(inds) >= vertex_count:
            return False, ok, f"bad-index={max(inds)}"
        ok += 1
    return True, ok, f"cursor={cursor}"


def check_faces_u16_triangles(data: bytes, offset: int, face_count: int, vertex_count: int, endian: str, sample=256):
    cursor = offset
    ok = 0
    for _ in range(min(face_count, sample)):
        if cursor + 6 > len(data):
            return False, ok, "eof"
        inds = struct.unpack_from(f"{endian}3H", data, cursor)
        cursor += 6
        if max(inds) >= vertex_count:
            return False, ok, f"bad-index={max(inds)}"
        ok += 1
    return True, ok, f"cursor={cursor}"


def check_faces_u32_standard(data: bytes, offset: int, face_count: int, vertex_count: int, endian: str, colors: bool, sample=128):
    cursor = offset
    ok = 0
    for _ in range(min(face_count, sample)):
        if cursor + 4 > len(data):
            return False, ok, "eof-count"
        n = struct.unpack_from(f"{endian}I", data, cursor)[0]
        cursor += 4
        if n < 3 or n > 16:
            return False, ok, f"bad-n={n}"
        need = n * 4
        if cursor + need > len(data):
            return False, ok, "eof-indices"
        inds = struct.unpack_from(f"{endian}{n}I", data, cursor)
        cursor += need
        if max(inds) >= vertex_count:
            return False, ok, f"bad-index={max(inds)}"
        if colors:
            if cursor + 4 > len(data):
                return False, ok, "eof-color-count"
            c = struct.unpack_from(f"{endian}I", data, cursor)[0]
            cursor += 4
            if c > 4 or cursor + c * 4 > len(data):
                return False, ok, f"bad-color-count={c}"
            cursor += c * 4
        ok += 1
    return True, ok, f"cursor={cursor}"


def probe(path: Path):
    data = path.read_bytes()
    vertex_offset, endian, (v, f, e) = read_header(data)
    print(f"FILE={path}")
    print(f"BYTES={len(data)} ENDIAN={'little' if endian == '<' else 'big'} V={v} F={f} E={e} VERTEX_OFFSET={vertex_offset}")

    any_candidate = False
    for stride in (12, 16, 20, 24, 28, 32):
        pos = positions_for_stride(data, vertex_offset, v, stride, endian)
        if pos is None:
            continue
        _, plausible, ext, max_abs, face_offset = pos
        if not plausible:
            continue
        print(f"VERTEX_STRIDE={stride} POSITIONS_PLAUSIBLE=True EXTENTS={[round(x,4) for x in ext]} MAXABS={max_abs:.4f} FACE_OFFSET={face_offset}")
        checks = [
            ("u16_counted", check_faces_u16_counted(data, face_offset, f, v, endian)),
            ("u16_triangles", check_faces_u16_triangles(data, face_offset, f, v, endian)),
            ("u32_no_colors", check_faces_u32_standard(data, face_offset, f, v, endian, False)),
            ("u32_colors", check_faces_u32_standard(data, face_offset, f, v, endian, True)),
        ]
        for name, (ok, count, detail) in checks:
            if ok:
                any_candidate = True
                # Estimate full fixed-size layouts where possible.
                est_end = None
                if name == "u16_triangles":
                    est_end = face_offset + f * 6
                print(f"CANDIDATE=PASS STRIDE={stride} FACE_LAYOUT={name} SAMPLE_FACES={count} DETAIL={detail} EST_END={est_end} TRAILING_EST={len(data)-est_end if est_end is not None else 'variable'}")
            else:
                print(f"CANDIDATE=FAIL STRIDE={stride} FACE_LAYOUT={name} SAMPLE_FACES={count} DETAIL={detail}")

    # Raw bytes at the canonical 12-byte-vertex OFF offset are useful if no parser matches.
    canonical_face_offset = vertex_offset + v * 12
    if canonical_face_offset < len(data):
        raw = data[canonical_face_offset:canonical_face_offset + 48]
        print(f"RAW_FACE_BYTES_AT_STRIDE12={raw.hex(' ')}")
        if len(raw) >= 24:
            print("RAW_U16_LE=" + str(list(struct.unpack_from("<12H", raw, 0))))
            print("RAW_U32_LE=" + str(list(struct.unpack_from("<6I", raw, 0))))

    print(f"GAUNTLET_LAYOUT_CANDIDATE={'PASS' if any_candidate else 'REVIEW'}")


def main():
    ap = argparse.ArgumentParser(description="Probe Exocad EOFF binary vertex/face layout without modifying files")
    ap.add_argument("input", type=Path, help="An .eoff file or a directory; first matching file is probed")
    args = ap.parse_args()
    p = args.input
    if p.is_dir():
        files = sorted(p.rglob("*.eoff"))
        if not files:
            raise SystemExit("No .eoff files found")
        p = files[0]
    probe(p)


if __name__ == "__main__":
    main()
