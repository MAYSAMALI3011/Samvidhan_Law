# -*- coding: utf-8 -*-
"""
Parse Statement of Objects and Reasons (SOR) files and map to Amendment Acts.
Maps the 5 files in content-sources/statements_of_objects_and_reasons/ via sources.csv.
"""
import os
import sys
import re
import json
import argparse
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import pymupdf


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


SOR_MAPPING = {
    "SOR_entry33_List3.pdf": {
        "amendment_number": 3,
        "year": 1954,
        "subject": "Entry 33 of List III (Concurrent List) regarding trade and commerce in essential foodstuffs and commodities",
        "affected_articles": ["Seventh Schedule (List III, Entry 33)"],
        "mover": "C. C. Biswas (Minister for Law and Minority Affairs)",
        "date_introduced": "1954",
        "notes": "Scanned image without embedded text layer; matched via Parliamentary Bill records for Constitution (Third Amendment) Act, 1954."
    },
    "SOR_Art164_proviso.pdf": {
        "amendment_number": 94,
        "year": 2006,
        "subject": "Proviso to clause (1) of Article 164 regarding Minister in charge of tribal welfare in Bihar, MP, Orissa, and new States of Jharkhand and Chhattisgarh",
        "affected_articles": ["164"],
        "mover": "Shivraj V. Patil (Home Minister)",
        "date_introduced": "2006",
        "notes": "Scanned document with text layer; matched to Constitution (Ninety-fourth Amendment) Act, 2006."
    },
    "SOR_Art334_reservation.pdf": {
        "amendment_number": 95,
        "year": 2009,
        "subject": "Article 334 reservation of seats for Scheduled Castes and Scheduled Tribes and Anglo-Indian representation from sixty years to seventy years",
        "affected_articles": ["334"],
        "mover": "M. Veerappa Moily (Minister of Law and Justice)",
        "date_introduced": "27th June, 2009",
        "notes": "Scanned document with OCR text; signed by M. Veerappa Moily; enacted as Constitution (Ninety-fifth Amendment) Act, 2009."
    },
    "SOR_Odia_Eighth_Schedule.pdf": {
        "amendment_number": 96,
        "year": 2011,
        "subject": "Eighth Schedule amendment changing language name from 'Oriya' to 'Odia' pursuant to Orissa Assembly resolution",
        "affected_articles": ["Eighth Schedule"],
        "mover": "P. Chidambaram (Minister of Home Affairs)",
        "date_introduced": "2010",
        "notes": "Scanned document with text layer; enacted as Constitution (Ninety-sixth Amendment) Act, 2011."
    },
    "SOR_cooperative_societies.pdf": {
        "amendment_number": 97,
        "year": 2011,
        "subject": "Insertion of Article 43B and Part IXB (Articles 243ZH-243ZT) to empower and regularize the co-operative sector",
        "affected_articles": ["19(1)(c)", "43B", "Part IXB", "243ZH", "243ZI", "243ZJ", "243ZK", "243ZL", "243ZM", "243ZN", "243ZO", "243ZP", "243ZQ", "243ZR", "243ZS", "243ZT"],
        "mover": "Sharad Pawar (Minister of Agriculture and Consumer Affairs)",
        "date_introduced": "2009",
        "notes": "Scanned document with text layer; enacted as Constitution (Ninety-seventh Amendment) Act, 2011."
    }
}


def parse_all_reasons(sor_dir: Path):
    results = []
    for filename, meta in SOR_MAPPING.items():
        filepath = sor_dir / filename
        if not filepath.exists():
            continue
            
        doc = pymupdf.open(str(filepath))
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        
        clean_text = text.strip()
        results.append({
            "filename": filename,
            "file_path": f"content-sources/statements_of_objects_and_reasons/{filename}",
            "amendment_number": meta["amendment_number"],
            "year": meta["year"],
            "subject": meta["subject"],
            "affected_articles": meta["affected_articles"],
            "mover": meta["mover"],
            "date_introduced": meta["date_introduced"],
            "raw_text_length": len(clean_text),
            "raw_text": clean_text if clean_text else "[Pure scanned image - text transcription pending verification]",
            "notes": meta["notes"],
            "verification_status": "unverified"
        })
        
    return results


def main():
    parser = argparse.ArgumentParser(description="Parse Statements of Objects and Reasons.")
    parser.add_argument("--sor-dir", default=str(REPO_ROOT / "content-sources" / "statements_of_objects_and_reasons"))
    args = parser.parse_args()

    sor_dir = Path(args.sor_dir)
    print(f"Parsing Statements of Objects and Reasons from: {sor_dir}")
    records = parse_all_reasons(sor_dir)
    print(f"Mapped {len(records)} Statement of Objects and Reasons documents.")

    for r in records:
        print(f"  {r['filename']} -> Amendment Act {r['amendment_number']} ({r['year']}): {r['subject'][:60]}...")

    # Export JSON
    export_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_documents": len(records),
        "records": records
    }
    write_repo_file("backend/reports/parsed_reasons.json", json.dumps(export_data, indent=2))
    print("\nWrote backend/reports/parsed_reasons.json")

    # Generate Markdown Report
    md_lines = [
        "# Constitution Amendment Acts: Statements of Objects & Reasons (Phase B3)",
        "",
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}  ",
        "**Source Directory:** `content-sources/statements_of_objects_and_reasons/`  ",
        "**Verification Status:** unverified (source documents mapped to official Amendment Acts)  ",
        "",
        "---",
        "",
        "## 1. Summary of Mapped Statements",
        "",
        "| File | Amendment Act | Year | Affected Articles / Subject | Mover / Signatory |",
        "|---|---|---|---|---|"
    ]

    for r in records:
        md_lines.append(f"| `{r['filename']}` | **{r['amendment_number']}th Amendment** | {r['year']} | {r['subject']} | {r['mover']} |")

    md_lines.extend([
        "",
        "---",
        "",
        "## 2. Detailed Document Transcripts & Provenance",
        ""
    ])

    for r in records:
        md_lines.extend([
            f"### {r['filename']} — {r['amendment_number']}th Amendment Act ({r['year']})",
            f"- **Subject**: {r['subject']}",
            f"- **Affected Provisions**: {', '.join(r['affected_articles'])}",
            f"- **Introduced / Signed**: {r['date_introduced']} by {r['mover']}",
            f"- **Extraction Length**: {r['raw_text_length']} characters",
            f"- **Notes**: {r['notes']}",
            f"- **Transcript Excerpt**:",
            "  ```text",
            "  " + "\n  ".join(r['raw_text'][:500].splitlines()),
            "  ```",
            ""
        ])

    write_repo_file("backend/reports/parse_reasons.md", "\n".join(md_lines) + "\n")
    print("Wrote backend/reports/parse_reasons.md")


if __name__ == '__main__':
    main()
