"""
CLI helper to mark a source document as verified or flagged in Supabase source_documents.

Usage:
  python backend/scripts/ingest/verify_source.py <document_id_or_file_path> [--flag] [--note "Reason"]
"""
import sys
import argparse
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.supabase_client import get_supabase_client


def main():
    parser = argparse.ArgumentParser(description="Verify or flag a source document in source_documents.")
    parser.add_argument("identifier", help="UUID id or file_path of the source document")
    parser.add_argument("--flag", action="store_true", help="Flag the document instead of verifying")
    parser.add_argument("--note", default=None, help="Optional note explaining verification or flag")
    args = parser.parse_args()

    status = "flagged" if args.flag else "verified"
    supabase = get_supabase_client()

    query = supabase.table("source_documents").select("*")
    if "-" in args.identifier and len(args.identifier) == 36:
        query = query.eq("id", args.identifier)
    else:
        query = query.eq("file_path", args.identifier)

    res = query.execute()
    if not res.data:
        print(f"Error: No source document found matching: {args.identifier}")
        sys.exit(1)

    doc = res.data[0]
    update_data = {
        "verification_status": status,
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if args.note:
        existing_notes = doc.get("notes") or ""
        update_data["notes"] = f"{existing_notes}; {args.note}".strip("; ")

    supabase.table("source_documents").update(update_data).eq("id", doc["id"]).execute()
    print(f"Document {doc['file_path']} (id: {doc['id']}) marked as {status.upper()}.")


if __name__ == "__main__":
    main()
