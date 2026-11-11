"""
Integrity check script:
Re-hashes every source PDF in content-sources/ and compares against registered catalog.
Prints a status table (MATCH, MISMATCH, MISSING, UNREGISTERED).
Exits with code 1 if any mismatch or missing file is detected.
"""
import os
import sys
import json
import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def main():
    catalog_path = REPO_ROOT / "backend" / "reports" / "sources_catalog.json"
    if not catalog_path.exists():
        print("Error: sources_catalog.json not found. Run register_sources.py first.")
        sys.exit(1)

    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    catalog_map = {r["file_path"].replace("\\", "/"): r["sha256"] for r in catalog.get("records", [])}

    sources_dir = REPO_ROOT / "content-sources"
    disk_files = {}
    for root, _, files in os.walk(sources_dir):
        for f in files:
            if f.lower().endswith(".pdf"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, REPO_ROOT).replace("\\", "/")
                disk_files[rel_path] = compute_sha256(full_path)

    all_paths = sorted(set(list(catalog_map.keys()) + list(disk_files.keys())))

    matches = 0
    mismatches = 0
    missing = 0
    unregistered = 0

    print("=" * 80)
    print(f"{'STATUS':<14} | {'FILE PATH'}")
    print("-" * 80)

    for p in all_paths:
        in_cat = p in catalog_map
        on_disk = p in disk_files

        if in_cat and on_disk:
            if catalog_map[p] == disk_files[p]:
                status = "MATCH"
                matches += 1
            else:
                status = "MISMATCH"
                mismatches += 1
        elif in_cat and not on_disk:
            status = "MISSING"
            missing += 1
        else:
            status = "UNREGISTERED"
            unregistered += 1

        if status != "MATCH":
            print(f"{status:<14} | {p}")

    print("=" * 80)
    print(f"Summary: MATCH={matches}, MISMATCH={mismatches}, MISSING={missing}, UNREGISTERED={unregistered}")
    print(f"Total checked: {len(all_paths)}")

    if mismatches > 0 or missing > 0:
        print("\nINTEGRITY CHECK FAILED: Hash mismatch or missing file(s) found!")
        sys.exit(1)
    else:
        print("\nINTEGRITY CHECK PASSED: All source documents are intact and match SHA-256 digests.")
        sys.exit(0)


if __name__ == "__main__":
    main()
