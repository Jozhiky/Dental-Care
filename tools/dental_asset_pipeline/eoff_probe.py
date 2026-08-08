from __future__ import annotations

import argparse
from pathlib import Path


def printable_ratio(data: bytes) -> float:
    if not data:
        return 0.0
    printable = sum((32 <= b <= 126) or b in (9, 10, 13) for b in data)
    return printable / len(data)


def safe_ascii(data: bytes) -> str:
    return ''.join(chr(b) if 32 <= b <= 126 else '.' for b in data)


def probe(root: Path) -> int:
    if not root.exists() or not root.is_dir():
        print(f"ERROR=INPUT_DIRECTORY_NOT_FOUND:{root}")
        print("GAUNTLET_EOFF_PROBE=FAIL")
        return 2

    files = sorted(root.rglob('*.eoff'))
    upper = [p for p in files if 'upperjaw' in {part.lower() for part in p.parts}]
    lower = [p for p in files if 'lowerjaw' in {part.lower() for part in p.parts}]

    print(f"ROOT={root}")
    print(f"EOFF_FILES={len(files)}")
    print(f"UPPER_EOFF={len(upper)}")
    print(f"LOWER_EOFF={len(lower)}")

    names_ok = sorted(p.stem for p in upper) == [str(i) for i in range(1, 9)] and sorted(p.stem for p in lower) == [str(i) for i in range(1, 9)]
    print(f"EXPECTED_1_TO_8_PER_JAW={names_ok}")

    for p in files:
        data = p.read_bytes()
        head = data[:64]
        ascii_ratio = printable_ratio(data[:1024])
        starts_off = head.lstrip().startswith((b'OFF', b'COFF', b'NOFF'))
        starts_eoff = head.lstrip().startswith(b'EOFF')
        print(
            f"FILE={p.relative_to(root)}|BYTES={len(data)}|"
            f"PRINTABLE_RATIO={ascii_ratio:.3f}|OFF_SIGNATURE={starts_off}|EOFF_SIGNATURE={starts_eoff}"
        )
        print(f"HEAD_HEX={head.hex(' ')}")
        print(f"HEAD_ASCII={safe_ascii(head)}")

    count_pass = len(files) == 16 and len(upper) == 8 and len(lower) == 8 and names_ok
    print(f"GAUNTLET_EOFF_STRUCTURE={'PASS' if count_pass else 'REVIEW'}")
    print("GAUNTLET_EOFF_PROBE=PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description='Inspect an Exocad .eoff tooth library without modifying files.')
    parser.add_argument('root', type=Path)
    args = parser.parse_args()
    return probe(args.root)


if __name__ == '__main__':
    raise SystemExit(main())
