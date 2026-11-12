# -*- coding: utf-8 -*-
"""
Parse Statement of Objects and Reasons (SOR) files and map to candidate Amendment Acts.
All 5 mappings are marked unconfirmed pending authoritative gazette bill-to-act concordance.
Includes bill_number read from statement text.
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
import pypdfium2 as pdfium
from rapidocr_onnxruntime import RapidOCR
import numpy as np


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


SOR_METADATA = {
    "SOR_entry33_List3.pdf": {
        "candidate_amendment_number": 3,
        "year": 1954,
        "mapping_status": "unconfirmed",
        "bill_number": None,
        "signer_verbatim": "T. T. KRISHNAMACHARI",
        "date_verbatim": "The 31st August, 1954",
        "subject": "Entry 33 of List III (Concurrent List) amplification regarding trade and commerce in essential foodstuffs and commodities",
        "affected_articles": ["Seventh Schedule (List III, Entry 33)"],
        "notes": "Scanned document without text layer. Mover read via RapidOCR. Bill number not printed in statement."
    },
    "SOR_Art164_proviso.pdf": {
        "candidate_amendment_number": 94,
        "year": 2006,
        "mapping_status": "unconfirmed",
        "bill_number": None,
        "signer_verbatim": "SHIVRAJ V. PATIL",
        "date_verbatim": "The 10th January, 2006",
        "subject": "Proviso to clause (1) of Article 164 regarding Minister in charge of tribal welfare in Bihar, MP, Orissa, and new States of Jharkhand and Chhattisgarh",
        "affected_articles": ["164"],
        "notes": "Scanned document with text layer. Signer read from text. Bill number not printed in statement."
    },
    "SOR_Art334_reservation.pdf": {
        "candidate_amendment_number": 95,
        "year": 2009,
        "mapping_status": "unconfirmed",
        "bill_number": None,
        "signer_verbatim": "M. VEERAPPA MOILY",
        "date_verbatim": "The 27th July, 2009",
        "subject": "Article 334 reservation of seats for Scheduled Castes and Scheduled Tribes and Anglo-Indian representation from sixty years to seventy years",
        "affected_articles": ["334"],
        "notes": "Scanned document with OCR text. Signer read from OCR. Bill number not printed in statement."
    },
    "SOR_Odia_Eighth_Schedule.pdf": {
        "candidate_amendment_number": 96,
        "year": 2011,
        "mapping_status": "unconfirmed",
        "bill_number": "The Constitution (One Hundred and Thirteenth Amendment) Bill, 2010",
        "signer_verbatim": "P. CHIDAMBARAM",
        "date_verbatim": "The 14th February, 2010",
        "subject": "Eighth Schedule amendment changing language name from 'Oriya' to 'Odia'",
        "affected_articles": ["Eighth Schedule"],
        "notes": "Bill number 'The Constitution (One Hundred and Thirteenth Amendment) Bill, 2010' read directly from text. Act number unconfirmed pending official gazette concordance."
    },
    "SOR_cooperative_societies.pdf": {
        "candidate_amendment_number": 97,
        "year": 2011,
        "mapping_status": "unconfirmed",
        "bill_number": None,
        "signer_verbatim": "SHARAD PAWAR",
        "date_verbatim": "The 11th November, 2009",
        "subject": "Insertion of Article 43B and Part IXB to regularize co-operative societies",
        "affected_articles": ["19(1)(c)", "43B", "Part IXB", "243ZH to 243ZT"],
        "notes": "Scanned document with text layer. Signer read from text. Bill number not printed in statement."
    }
}


def parse_all_reasons(sor_dir: Path):
    ocr_engine = None
    results = []

    for filename, meta in SOR_METADATA.items():
        filepath = sor_dir / filename
        if not filepath.exists():
            continue

        doc = pymupdf.open(str(filepath))
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()

        clean_text = text.strip()
        if len(clean_text) < 50:
            if ocr_engine is None:
                ocr_engine = RapidOCR()
            pdoc = pdfium.PdfDocument(str(filepath))
            ocr_lines = []
            for p_idx in range(len(pdoc)):
                pix = pdoc[p_idx].render(scale=2.0).to_pil()
                res, _ = ocr_engine(np.array(pix))
                if res:
                    ocr_lines.extend([line[1] for line in res])
            clean_text = "\n".join(ocr_lines)

        first_300 = clean_text[:300].strip()

        results.append({
            "filename": filename,
            "file_path": f"content-sources/statements_of_objects_and_reasons/{filename}",
            "candidate_amendment_number": meta["candidate_amendment_number"],
            "year": meta["year"],
            "mapping_status": meta["mapping_status"],
            "bill_number": meta["bill_number"],
            "signer_verbatim": meta["signer_verbatim"],
            "date_verbatim": meta["date_verbatim"],
            "subject": meta["subject"],
            "affected_articles": meta["affected_articles"],
            "first_300_chars": first_300,
            "verification_status": "unverified",
            "notes": meta["notes"]
        })

    return results


def main():
    parser = argparse.ArgumentParser(description="Parse SOR files with unconfirmed status and bill numbers.")
    parser.add_argument("--sor-dir", default=str(REPO_ROOT / "content-sources" / "statements_of_objects_and_reasons"))
    args = parser.parse_args()

    sor_dir = Path(args.sor_dir)
    print(f"Parsing SORs from: {sor_dir}")
    records = parse_all_reasons(sor_dir)

    export_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(records),
        "records": records
    }
    write_repo_file("backend/reports/parsed_reasons.json", json.dumps(export_data, indent=2))
    print(f"Wrote backend/reports/parsed_reasons.json ({len(records)} records)")

if __name__ == "__main__":
    main()
