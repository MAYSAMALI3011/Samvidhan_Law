# -*- coding: utf-8 -*-
"""
Parse footnotes from the Constitution of India into draft law_history_entries.
Extracts amendment numbers, effective dates, amending sections, and previous law text.
All extracted entries are initialized as draft/unverified.
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


def parse_all_footnotes(pdf_path: Path):
    doc = pymupdf.open(str(pdf_path))
    
    # 1. Map pages to articles
    page_to_articles = {}
    for p_idx in range(31, 283):
        p_num = p_idx + 1
        txt = doc[p_idx].get_text("text")
        arts = []
        for m in re.finditer(r'(?:^|\n)[ \t]*(?:[*\s\[\(\d]*?)(\d+[A-Z0-9-]*)[ \t]*\.[ \t]*', txt):
            art = m.group(1).replace('-', '')
            m_dig = re.match(r'^\d+', art)
            if m_dig and int(m_dig.group(0)) <= 395 and art not in arts:
                arts.append(art)
        page_to_articles[p_num] = arts

    # 2. Extract footnotes
    entries = []
    types_count = {}
    has_old_text_count = 0

    for p_idx in range(31, 283):
        p_num = p_idx + 1
        blocks = doc[p_idx].get_text("blocks", sort=True)
        fn_started = False
        fn_text = ""
        for b in blocks:
            t = b[4].strip()
            y0 = b[1]
            if y0 > 520 and (re.match(r'^\d+\.\s*(Subs\.|Ins\.|Omitted|Added|Renumbered|The words|Certain words|See|Rep\.)', t) or (fn_started and re.match(r'^\d+\.\s+', t))):
                fn_started = True
            if fn_started:
                fn_text += "\n" + t
        
        parts = re.split(r'\n(?=\d+\.\s+)', fn_text.strip())
        for pt in parts:
            pt = pt.strip()
            if not pt or not re.match(r'^\d+\.\s+', pt):
                continue
            
            m_num = re.match(r'^(\d+)\.\s*', pt)
            fn_idx = int(m_num.group(1)) if m_num else None
            fn_body = re.sub(r'^\d+\.\s*', '', pt).strip()
            
            ftype = "other"
            old_text = None
            
            if fn_body.startswith("Subs.") or "substituted" in fn_body.lower():
                ftype = "substitution"
                m_old = re.search(r'for\s+["\u201c]([^"\u201d]+)["\u201d]', fn_body)
                if m_old:
                    old_text = m_old.group(1).strip()
            elif fn_body.startswith("Ins.") or "inserted" in fn_body.lower():
                ftype = "insertion"
            elif fn_body.startswith("Omitted") or "omitted" in fn_body.lower():
                ftype = "omission"
                m_old = re.search(r'(?:words|figures|letter)\s+["\u201c]([^"\u201d]+)["\u201d]', fn_body)
                if m_old:
                    old_text = m_old.group(1).strip()
            elif fn_body.startswith("Renumbered"):
                ftype = "renumbering"
            elif fn_body.startswith("Added"):
                ftype = "addition"
            elif fn_body.startswith("Rep."):
                ftype = "repeal"
                
            types_count[ftype] = types_count.get(ftype, 0) + 1
            if old_text:
                has_old_text_count += 1
                
            amd_num = None
            m_amd = re.search(r'Constitution\s+\(([^)]+)\s+Amendment\)\s+Act', fn_body, re.IGNORECASE)
            if m_amd:
                ord_str = m_amd.group(1).strip()
                try:
                    amd_num = ordinal_to_number(ord_str)
                except Exception:
                    pass
            
            m_yr = re.search(r'Act,\s*(\d{4})', fn_body)
            year = int(m_yr.group(1)) if m_yr else None
            
            m_sec = re.search(r',\s*s\.\s*(\d+[A-Z]*)', fn_body)
            section = m_sec.group(1) if m_sec else None
            
            m_wef = re.search(r'\(w\.e\.f\.\s*([^)]+)\)', fn_body)
            wef = m_wef.group(1).strip() if m_wef else None
            
            associated_arts = page_to_articles.get(p_num, [])
            primary_art = associated_arts[0] if associated_arts else None
            
            entries.append({
                "page": p_num,
                "footnote_number": fn_idx,
                "footnote_type": ftype,
                "article_candidates": associated_arts,
                "primary_article": primary_art,
                "amendment_number": amd_num,
                "year": year,
                "section": section,
                "effective_date": wef,
                "old_text": old_text,
                "raw_text": fn_body,
                "verification_status": "draft",
                "published": False
            })

    doc.close()
    return entries, types_count, has_old_text_count


def main():
    parser = argparse.ArgumentParser(description="Parse Constitution footnotes into draft law history entries.")
    parser.add_argument("--pdf", default=str(REPO_ROOT / "content-sources" / "constitution" / "Constitution_of_India_English.pdf"))
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    print(f"Parsing footnotes from: {pdf_path}")
    entries, types_count, has_old_text_count = parse_all_footnotes(pdf_path)

    print(f"\nExtracted {len(entries)} footnotes total.")
    print("Counts by footnote type:")
    for t, cnt in sorted(types_count.items()):
        print(f"  {t:15s}: {cnt}")
    print(f"Footnotes with extracted old_text: {has_old_text_count}")

    export_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_footnotes": len(entries),
        "types_count": types_count,
        "has_old_text_count": has_old_text_count,
        "entries": entries
    }
    write_repo_file("backend/reports/parsed_footnotes.json", json.dumps(export_data, indent=2))
    print("Wrote backend/reports/parsed_footnotes.json")

    md_lines = [
        "# Constitution of India: Footnotes Ingestion Report (Phase B3)",
        "",
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}  ",
        f"**Source Document:** `content-sources/constitution/Constitution_of_India_English.pdf`  ",
        "**Verification Status:** draft / unverified (extracted evidence awaiting reviewer publish)  ",
        "",
        "---",
        "",
        "## 1. Footnote Extraction Summary",
        "",
        "| Metric | Value |",
        "|---|---|",
        f"| **Total Footnotes Extracted** | **{len(entries)}** |",
        f"| **Entries with Predecessor Law (old_text)** | **{has_old_text_count}** |",
        f"| **Entries with Identified Amendment Act** | **{sum(1 for e in entries if e['amendment_number'])}** |",
        f"| **Entries with Effective Date (w.e.f.)** | **{sum(1 for e in entries if e['effective_date'])}** |",
        "",
        "---",
        "",
        "## 2. Footnote Breakdown by Modification Type",
        "",
        "| Modification Type | Count | Description |",
        "|---|---|---|"
    ]

    desc_map = {
        "substitution": "Replaces former text (contains 'for ...' clauses)",
        "insertion": "Introduces new article, clause, or words",
        "omission": "Deletes or repeals article, clause, or words",
        "addition": "Appends supplemental proviso or explanation",
        "renumbering": "Adjusts clause or sub-clause numbering",
        "repeal": "Repealed by Parliament or constitutional order",
        "other": "Judicial rulings, territorial adaptations, notifications"
    }

    for t, cnt in sorted(types_count.items()):
        md_lines.append(f"| **{t.title()}** | {cnt} | {desc_map.get(t, '')} |")

    md_lines.extend([
        "",
        "---",
        "",
        "## 3. Sample Draft Law History Entries (Extracted with Predecessor Text)",
        ""
    ])

    sample_entries = [e for e in entries if e["old_text"] and e["amendment_number"]][:5]
    for s in sample_entries:
        md_lines.extend([
            f"### Page {s['page']}: Amendment {s['amendment_number']} ({s['year'] or 'Year N/A'})",
            f"- **Candidate Article**: Article {s['primary_article'] or 'N/A'}",
            f"- **Type**: {s['footnote_type']}",
            f"- **Amending Act**: Constitution ({s['amendment_number']}th Amendment) Act, {s['year'] or ''}, {s['section'] or ''}",
            f"- **Effective Date**: {s['effective_date'] or 'N/A'}",
            f"- **Older Law Text (`old_text`)**:",
            f"  > \"{s['old_text']}\"",
            f"- **Raw Footnote**: `{s['raw_text']}`",
            ""
        ])

    write_repo_file("backend/reports/parse_footnotes.md", "\n".join(md_lines) + "\n")
    print("Wrote backend/reports/parse_footnotes.md")


if __name__ == '__main__':
    main()
