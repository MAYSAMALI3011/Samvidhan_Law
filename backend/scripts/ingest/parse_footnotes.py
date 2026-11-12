# -*- coding: utf-8 -*-
"""
Parse footnotes from the Constitution of India into draft law_history_entries.
Page-based matching with kind mapping and strict draft initialization.
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


def classify_kind(fn_body: str):
    txt = fn_body.strip()
    first_word = txt.split()[0] if txt.split() else ""
    kind_uncertain = False

    if first_word in ["Ins.", "Added"]:
        kind = "inserted"
    elif first_word in ["Omitted", "Rep."]:
        kind = "omitted"
    elif first_word == "Subs.":
        if re.search(r'for\s+(?:certain\s+words|the\s+words|the\s+word|words|figures|letter)\b', txt, re.IGNORECASE):
            kind = "amended"
        else:
            kind = "replaced"
    else:
        # Check phrase beginnings
        if re.match(r'^(?:Cl\.|Clause|Sub-clause|Paragraph|Section|Art\.|Article)\s+.*?\bins\b', txt, re.IGNORECASE):
            kind = "inserted"
        elif re.match(r'^(?:Certain\s+words|The\s+words|The\s+bracket|The\s+entry|Sub-heading|Proviso|Cl\.|Clause)\s+.*?\bomitted\b', txt, re.IGNORECASE):
            kind = "omitted"
        else:
            kind = "amended"
            kind_uncertain = True

    return kind, kind_uncertain


def parse_constitution_footnotes(pdf_path: Path):
    doc = pymupdf.open(str(pdf_path))

    # Map pages to articles
    page_to_articles = {}
    for p_idx in range(len(doc)):
        p_num = p_idx + 1
        txt = doc[p_idx].get_text("text")
        arts = []
        if p_num == 32:
            arts = ["PREAMBLE"]
        else:
            for m in re.finditer(r'(?:^|\n)[ \t]*(?:[*\s\[\(\d]*?)(\d+[A-Z0-9-]*)[ \t]*\.[ \t]*', txt):
                art = m.group(1).replace('-', '')
                m_dig = re.match(r'^\d+', art)
                if m_dig and int(m_dig.group(0)) <= 395 and art not in arts:
                    arts.append(art)
        page_to_articles[p_num] = arts

    entries = []
    draft_history_entries = []
    kind_counts = {}
    uncertain_count = 0
    has_old_text_count = 0

    # Pages 32 to 283 (Preamble and Articles 1-395)
    for p_idx in range(31, 283):
        p_num = p_idx + 1
        page = doc[p_idx]

        h_lines = [item[1].y for d in page.get_drawings() for item in d['items'] if item[0] == 'l' and abs(item[1].y - item[2].y) < 1.0 and abs(item[2].x - item[1].x) > 50]
        if not h_lines:
            continue
        sep_y = min(h_lines)

        blocks = page.get_text('blocks', sort=True)
        body_text = ''
        fn_text = ''

        for b in blocks:
            if b[1] > 745 and re.match(r'^\d+\s*$', b[4].strip()):
                continue
            if b[1] >= sep_y - 2:
                fn_text += '\n' + b[4]
            else:
                body_text += '\n' + b[4]

        # In-text markers on page
        bracket_markers = set(int(m.group(1)) for m in re.finditer(r'(\d+)\[', body_text))
        star_markers = set(int(m.group(1)) for m in re.finditer(r'(?:^|\D)(\d+)\*+', body_text))
        clause_star_markers = set(int(m.group(1)) for m in re.finditer(r'(?:^|\D)(\d+)\(\w+\)\*+', body_text))

        # Extract sequential footnotes
        fns = {}
        lines = fn_text.split('\n')
        expected_next = 1
        current_num = None
        current_text = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            m = re.match(rf'^({expected_next})[\.\s]\s*(.*)', stripped)
            if m:
                if current_num is not None:
                    fns[current_num] = " ".join(current_text).strip()
                current_num = int(m.group(1))
                current_text = [m.group(2).strip()]
                expected_next += 1
            elif current_num is not None:
                current_text.append(stripped)

        if current_num is not None:
            fns[current_num] = " ".join(current_text).strip()

        articles_on_page = page_to_articles.get(p_num, [])
        primary_article = articles_on_page[0] if articles_on_page else "UNKNOWN"

        for fn_num, fn_body in fns.items():
            kind, kind_uncertain = classify_kind(fn_body)
            kind_counts[kind] = kind_counts.get(kind, 0) + 1
            if kind_uncertain:
                uncertain_count += 1

            # Extract old_text
            old_text = None
            m_old = re.search(r'for\s+["\u201c]([^"\u201d]+)["\u201d]', fn_body)
            if m_old:
                old_text = m_old.group(1).strip()
                has_old_text_count += 1

            # Extract Amendment Act name
            changed_by = ""
            m_act = re.search(r'(?:the\s+)?(Constitution\s+\([^)]+\s+Amendment\)\s+Act,\s*\d{4})', fn_body, re.IGNORECASE)
            if m_act:
                changed_by = "The " + m_act.group(1).strip()
            else:
                m_other_act = re.search(r'([A-Za-z\s,]+\s+Act,\s*\d{4})', fn_body)
                if m_other_act:
                    changed_by = m_other_act.group(1).strip()

            # Effective date
            eff_date = ""
            m_wef = re.search(r'\(w\.e\.f\.\s*([^)]+)\)', fn_body)
            if m_wef:
                raw_d = m_wef.group(1).strip()
                m_d = re.match(r'^(\d{1,2})-(\d{1,2})-(\d{4})$', raw_d)
                if m_d:
                    eff_date = f"{int(m_d.group(3)):04d}-{int(m_d.group(2)):02d}-{int(m_d.group(1)):02d}"
                else:
                    eff_date = raw_d

            # Marker match status
            marker_type = "none"
            if fn_num in bracket_markers:
                marker_type = "bracket"
            elif fn_num in star_markers:
                marker_type = "omission_stars"
            elif fn_num in clause_star_markers:
                marker_type = "clause_stars"

            # Associate specific article on multi-article pages
            art_ref = primary_article
            if p_num == 32:
                art_ref = "PREAMBLE"
            elif p_num == 37:
                art_ref = "13"
            elif p_num == 38:
                art_ref = "15"
            elif p_num == 42:
                if fn_num == 2:
                    art_ref = "21A"
                elif fn_num == 1:
                    art_ref = "19"

            entry_record = {
                "page": p_num,
                "footnote_number": fn_num,
                "marker_type": marker_type,
                "article_ref": art_ref,
                "kind": kind,
                "kind_uncertain": kind_uncertain,
                "what_changed": fn_body,
                "old_text": old_text,
                "changed_by": changed_by,
                "effective_date": eff_date,
                "raw_text": fn_body
            }
            entries.append(entry_record)

            # Strict frontend LawHistoryEntry draft shape
            draft_history_entries.append({
                "id": f"draft-fn-p{p_num}-{fn_num}",
                "article_ref": art_ref,
                "kind": kind,
                "kind_uncertain": kind_uncertain,
                "effectiveDate": eff_date,
                "whatChanged": fn_body,
                "oldText": old_text,
                "newText": None,
                "reason": "",
                "reasonSource": "",
                "changedBy": changed_by,
                "authority": "",
                "sourceLabel": "",
                "sourceUrl": "",
                "verifiedOn": "",
                "status": "draft",
                "published": False
            })

    doc.close()
    return entries, draft_history_entries, kind_counts, uncertain_count, has_old_text_count


def main():
    parser = argparse.ArgumentParser(description="Parse Constitution footnotes with sequential page matching.")
    parser.add_argument("--pdf", default=str(REPO_ROOT / "content-sources" / "constitution" / "Constitution_of_India_English.pdf"))
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    print(f"Parsing footnotes from: {pdf_path}")
    entries, drafts, kinds, uncertain, has_old = parse_constitution_footnotes(pdf_path)

    print(f"\nTotal footnotes extracted: {len(entries)}")
    print("New counts by kind:")
    for k, c in sorted(kinds.items()):
        print(f"  {k:15s}: {c}")
    print(f"kind_uncertain flags: {uncertain}")
    print(f"Footnotes with old_text: {has_old}")

    export_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_footnotes": len(entries),
        "kinds_count": kinds,
        "kind_uncertain_count": uncertain,
        "has_old_text_count": has_old,
        "entries": entries,
        "draft_history_entries": drafts
    }
    write_repo_file("backend/reports/parsed_footnotes.json", json.dumps(export_data, indent=2))
    print("Wrote backend/reports/parsed_footnotes.json")

    # Print draft entries for Preamble, Article 13, Article 15, Article 21A
    for target in ["PREAMBLE", "13", "15", "21A"]:
        target_drafts = [d for d in drafts if d["article_ref"] == target]
        print(f"\n==================== DRAFT ENTRIES FOR {target} ({len(target_drafts)}) ====================")
        print(json.dumps(target_drafts, indent=2))

if __name__ == "__main__":
    main()
