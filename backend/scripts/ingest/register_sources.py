"""
Scan content-sources/ and register all source PDFs into source_documents table.
Computes SHA-256, page counts, extraction type (text vs ocr), and logs ingest run.
"""
import os
import sys
import json
import hashlib
import argparse
from datetime import datetime, timezone
from pathlib import Path

# Ensure repo root is on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import pymupdf
from backend.scripts.ingest.ordinals import ordinal_to_number
from backend.scripts.writer import write_repo_file


def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def detect_extraction_type(doc: pymupdf.Document) -> str:
    """If text across first 3 pages > 100 chars -> 'text', else 'ocr'."""
    text_sample = ""
    pages_to_check = min(3, len(doc))
    for i in range(pages_to_check):
        text_sample += doc[i].get_text("text")
    return "text" if len(text_sample.strip()) > 100 else "ocr"


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
        
    if "constitution" in rel_normalized or filename.startswith("95ef") or filename.startswith("5756"):
        notes = "English edition" if "english" in filename.lower() or filename.startswith("95ef") else "Bilingual edition"
        return "constitution", None, notes
        
    return "other", None, ""


def scan_sources(sources_dir: str):
    records = []
    sources_path = Path(sources_dir)
    
    for root, _, files in os.walk(sources_path):
        for f in sorted(files):
            if not f.lower().endswith(".pdf"):
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, REPO_ROOT).replace("\\", "/")
            
            sha = compute_sha256(full_path)
            try:
                doc = pymupdf.open(full_path)
                page_count = len(doc)
                ext_type = detect_extraction_type(doc)
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
    parser = argparse.ArgumentParser(description="Register source documents into Supabase source_documents table.")
    parser.add_argument("--sources-dir", default=str(REPO_ROOT / "content-sources"), help="Directory holding PDF sources")
    parser.add_argument("--dry-run", action="store_true", help="Scan and report only, do not write to database")
    args = parser.parse_args()

    print(f"Scanning source PDFs in {args.sources_dir}...")
    records = scan_sources(args.sources_dir)
    print(f"Discovered {len(records)} PDF documents.")

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

    # Write report safely via git
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

    if args.dry_run:
        print("\n[Dry Run] Skipping Supabase database upsert.")
        return

    # Attempt Supabase database upsert if configured
    try:
        from backend.app.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        print("\nConnected to Supabase. Upserting into source_documents...")
        
        # Log ingest run start
        run_record = {
            "run_type": "sources",
            "status": "started",
            "stats": {"total": len(records), "text": text_count, "ocr": ocr_count}
        }
        res_run = supabase.table("ingest_runs").insert(run_record).execute()
        run_id = res_run.data[0]["id"] if res_run.data else None

        upserted = 0
        for r in records:
            data = {
                "file_path": r["file_path"],
                "kind": r["kind"],
                "amendment_number": r["amendment_number"],
                "sha256": r["sha256"],
                "page_count": r["page_count"],
                "extraction_type": r["extraction_type"],
                "notes": r["notes"],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table("source_documents").upsert(data, on_conflict="file_path").execute()
            upserted += 1

        if run_id:
            supabase.table("ingest_runs").update({
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "stats": {"total": len(records), "upserted": upserted, "text": text_count, "ocr": ocr_count}
            }).eq("id", run_id).execute()

        print(f"Successfully upserted {upserted} source documents in Supabase.")
    except Exception as e:
        print(f"\nSupabase upsert skipped or failed: {e}")
        print("Note: To run live against Supabase, ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured in backend/.env")


if __name__ == "__main__":
    main()
