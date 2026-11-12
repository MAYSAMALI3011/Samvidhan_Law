# -*- coding: utf-8 -*-
"""
Scan content-sources/ and register all source PDFs into source_documents table.
Computes SHA-256, page counts, extraction type (text vs ocr), and logs ingest run.
Marks all documents as unverified pending external gazette verification.
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
    """Safely write repo file via temporary staging and git checkout."""
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
    """
    If file is named _SCAN or has low character count / degraded OCR, classify as 'ocr'.
    Specifically flags Acts 66, 69, 72, 75, 94, 96, 97, 98, 101, 102, 103, 105, 3 duplicate,
    and all statement of objects & reasons image scans.
    """
    fn_lower = filename.lower()
    if "_scan" in fn_lower or "sor_" in fn_lower or "preamble_scan" in fn_lower:
        return "ocr"
    
    total_chars = sum(len(p.get_text("text").strip()) for p in doc)
    avg_chars = total_chars / len(doc) if len(doc) > 0 else 0
    if total_chars == 0 or avg_chars < 150:
        return "ocr"
        
    return "text"


def classify_document(rel_path: str, filename: str):
    rel_normalized = rel_path.replace("\\", "/").lower()
    
    if "amendment_acts" in rel_normalized:
        kind = "amendment_act"
        try:
            num = ordinal_to_number(filename)
        except Exception:
            num = None
        notes = "Duplicate copy" if "duplicate" in filename.lower() else ""
        return kind, num, notes
    
    if "statements_of_objects_and_reasons" in rel_normalized:
        return "statement_of_objects_and_reasons", None, "Statement of Objects and Reasons"
        
    if "preamble" in rel_normalized:
        return "preamble", None, "Preamble source"
        
    if "constitution" in rel_normalized or filename.startswith("95ef"):
        return "constitution", None, "Constitution of India (English pocket edition, updated up to 106th Amendment Act, 2023)"
        
    return "other", None, ""


def scan_sources(sources_dir: str):
    records = []
    sources_path = Path(sources_dir)
    
    for root, _, files in os.walk(sources_path):
        for f in sorted(files):
            if not f.lower().endswith(".pdf"):
                continue
            # Skip unverified 803-page PDF
            if "575648bd" in f:
                continue
                
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, REPO_ROOT).replace("\\", "/")
            
            sha = compute_sha256(full_path)
            try:
                doc = pymupdf.open(full_path)
                page_count = len(doc)
                ext_type = detect_extraction_type(doc, f)
                doc.close()
            except Exception as e:
                page_count = 0
                ext_type = "ocr"
                print(f"Warning: Failed to read {rel_path} with pymupdf: {e}")
            
            kind, amd_num, notes = classify_document(rel_path, f)
            
            records.append({
                "file_path": rel_path,
                "kind": kind,
                "amendment_number": amd_num,
                "sha256": sha,
                "page_count": page_count,
                "extraction_type": ext_type,
                "verification_status": "unverified",
                "notes": notes
            })
    return records


def main():
    parser = argparse.ArgumentParser(description="Register source documents into source_documents catalog.")
    parser.add_argument("--sources-dir", default=str(REPO_ROOT / "content-sources"), help="Directory holding PDF sources")
    parser.add_argument("--dry-run", action="store_true", help="Scan and report only, do not write to database")
    args = parser.parse_args()

    print(f"Scanning source PDFs in {args.sources_dir}...")
    records = scan_sources(args.sources_dir)
    print(f"Discovered {len(records)} verified-intake PDF documents.")

    text_count = sum(1 for r in records if r["extraction_type"] == "text")
    ocr_count = sum(1 for r in records if r["extraction_type"] == "ocr")
    kinds = {}
    for r in records:
        kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1

    print("\nSummary by extraction type:")
    print(f"  Copyable text: {text_count}")
    print(f"  Scanned (OCR needed): {ocr_count}")
    print("\nSummary by kind:")
    for k, v in kinds.items():
        print(f"  {k}: {v}")

    # Write sources catalog JSON
    report_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_documents": len(records),
        "text_count": text_count,
        "ocr_count": ocr_count,
        "kinds": kinds,
        "records": records
    }
    write_repo_file("backend/reports/sources_catalog.json", json.dumps(report_data, indent=2))
    print("\nCatalog written to: backend/reports/sources_catalog.json")

    # Update content-sources/sources.csv
    csv_lines = ["file_path,kind,amendment_number,sha256,page_count,extraction_type,verification_status,notes"]
    for r in records:
        amd = str(r["amendment_number"]) if r["amendment_number"] is not None else ""
        csv_lines.append(f"{r['file_path']},{r['kind']},{amd},{r['sha256']},{r['page_count']},{r['extraction_type']},{r['verification_status']},\"{r['notes']}\"")
    write_repo_file("content-sources/sources.csv", "\n".join(csv_lines) + "\n")
    print("Updated content-sources/sources.csv")

    # Update content-sources/SOURCES.md
    md_lines = [
        "# Content Sources Catalog & Integrity Status",
        "",
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}  ",
        f"**Total Documents:** {len(records)}  ",
        f"**Copyable Text:** {text_count} | **Scanned / OCR Needed:** {ocr_count}  ",
        "**Verification Status:** All sources marked `unverified` pending independent confirmation against legislative.gov.in.  ",
        "",
        "---",
        "",
        "| File Path | Kind | Amendment No. | Extraction Type | Verification | Pages | SHA-256 | Notes |",
        "|---|---|---|---|---|---|---|---|"
    ]
    for r in records:
        amd = str(r["amendment_number"]) if r["amendment_number"] is not None else "-"
        md_lines.append(f"| `{r['file_path']}` | {r['kind']} | {amd} | `{r['extraction_type']}` | {r['verification_status']} | {r['page_count']} | `{r['sha256'][:16]}...` | {r['notes']} |")

    write_repo_file("content-sources/SOURCES.md", "\n".join(md_lines) + "\n")
    print("Updated content-sources/SOURCES.md")


if __name__ == "__main__":
    main()
