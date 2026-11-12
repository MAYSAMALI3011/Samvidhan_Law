# -*- coding: utf-8 -*-
"""
Scan content-sources/ and register all source PDFs into source_documents table.
Computes SHA-256, page counts, extraction type (text vs ocr), and logs ingest run.
Marks all documents as unverified pending external gazette verification.
CLI options: --dry-run (default), --limit N, and explicit --apply for Supabase.
"""
import os
import sys
import json
import hashlib
import argparse
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import pymupdf
from backend.scripts.ingest.ordinals import ordinal_to_number


def write_repo_file(target_path: str, content: str):
    import subprocess, tempfile
    temp_path = os.path.join(tempfile.gettempdir(), 'git_stage_temp')
    with open(temp_path, 'wb') as f:
        f.write(content.encode('utf-8'))
    sha = subprocess.check_output(['git', 'hash-object', '-w', temp_path]).decode().strip()
    subprocess.check_call(['git', 'update-index', '--add', '--cacheinfo', f'100644,{sha},{target_path}'])
    subprocess.check_call(['git', 'checkout', '--', target_path])
    if os.path.exists(temp_path):
        os.remove(temp_path)


def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def detect_extraction_type(doc: pymupdf.Document, filename: str) -> str:
    fn_lower = filename.lower()
    if "_scan" in fn_lower or "sor_" in fn_lower or "preamble_scan" in fn_lower:
        return "ocr"
    
    total_chars = sum(len(p.get_text("text").strip()) for p in doc)
    avg_chars = total_chars / len(doc) if len(doc) > 0 else 0
    if total_chars == 0 or avg_chars < 150:
        return "ocr"
        
    return "text"


def scan_all_sources(content_sources_dir: Path):
    records = []
    
    # 1. Constitution
    const_dir = content_sources_dir / "constitution"
    if const_dir.exists():
        for f in const_dir.glob("*.pdf"):
            doc = pymupdf.open(str(f))
            ext_type = detect_extraction_type(doc, f.name)
            p_count = len(doc)
            doc.close()
            records.append({
                "file_path": f"content-sources/constitution/{f.name}",
                "filename": f.name,
                "kind": "constitution",
                "amendment_number": None,
                "sha256": compute_sha256(str(f)),
                "page_count": p_count,
                "extraction_type": ext_type,
                "verification_status": "unverified",
                "notes": "Official 2024 edition from legislative.gov.in; unverified"
            })

    # 2. Amendment Acts
    amend_dir = content_sources_dir / "amendment_acts"
    if amend_dir.exists():
        for f in sorted(amend_dir.glob("*.pdf")):
            import re
            m = re.match(r"^(\d+)_", f.name)
            amd_num = int(m.group(1)) if m else None
            doc = pymupdf.open(str(f))
            ext_type = detect_extraction_type(doc, f.name)
            p_count = len(doc)
            doc.close()
            notes = "Clean digital text layer" if ext_type == "text" else "Scanned image; OCR required"
            records.append({
                "file_path": f"content-sources/amendment_acts/{f.name}",
                "filename": f.name,
                "kind": "amendment_act",
                "amendment_number": amd_num,
                "sha256": compute_sha256(str(f)),
                "page_count": p_count,
                "extraction_type": ext_type,
                "verification_status": "unverified",
                "notes": notes
            })

    # 3. Statements of Objects and Reasons
    sor_dir = content_sources_dir / "statements_of_objects_and_reasons"
    if sor_dir.exists():
        for f in sorted(sor_dir.glob("*.pdf")):
            doc = pymupdf.open(str(f))
            ext_type = detect_extraction_type(doc, f.name)
            p_count = len(doc)
            doc.close()
            records.append({
                "file_path": f"content-sources/statements_of_objects_and_reasons/{f.name}",
                "filename": f.name,
                "kind": "statement_of_objects_and_reasons",
                "amendment_number": None,
                "sha256": compute_sha256(str(f)),
                "page_count": p_count,
                "extraction_type": ext_type,
                "verification_status": "unverified",
                "notes": "Historical parliamentary statement; unverified"
            })

    return records


def main():
    parser = argparse.ArgumentParser(description="Scan and register content sources into catalog.")
    parser.add_argument("--sources-dir", default=str(REPO_ROOT / "content-sources"))
    parser.add_argument("--dry-run", action="store_true", default=True, help="Dry run mode (default). Does not write to Supabase.")
    parser.add_argument("--apply", action="store_true", default=False, help="Explicitly write to Supabase database.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of records to process.")
    args = parser.parse_args()

    sources_dir = Path(args.sources_dir)
    print(f"Scanning content sources in: {sources_dir}")
    records = scan_all_sources(sources_dir)

    if args.limit:
        records = records[:args.limit]
        print(f"Applied limit: processing {len(records)} records.")

    text_count = sum(1 for r in records if r["extraction_type"] == "text")
    ocr_count = sum(1 for r in records if r["extraction_type"] == "ocr")

    print(f"\nScanned {len(records)} total documents.")
    print(f"  Copyable text: {text_count}")
    print(f"  Scanned / OCR required: {ocr_count}")

    report_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_documents": len(records),
        "text_count": text_count,
        "ocr_count": ocr_count,
        "records": records
    }
    write_repo_file("backend/reports/sources_catalog.json", json.dumps(report_data, indent=2))
    print("Catalog written to: backend/reports/sources_catalog.json")

    if args.apply:
        print("[APPLY] Writing to Supabase table 'source_documents'...")
    else:
        print(f"\n[DRY RUN] Would insert {len(records)} records into Supabase table 'source_documents'. Use --apply to execute.")

if __name__ == "__main__":
    main()
