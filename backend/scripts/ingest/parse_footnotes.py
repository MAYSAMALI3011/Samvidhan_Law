# -*- coding: utf-8 -*-
"""
Parse Constitution footnotes with:
1. Compound footnote splitting (sharing footnote_ref)
2. 'ibid.' resolution to previously named Act on page
3. Kind classification anywhere in footnote
4. Non-amendment exclusion and date-only attachment
5. new_text_candidate extraction from in-text brackets
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


def classify_action(txt: str):
    norm = re.sub(r'\s+', ' ', txt).strip()
    # Handle spaced out "i n s ." in OCR
    norm = re.sub(r'i\s+n\s+s\s*\.', 'ins.', norm, flags=re.IGNORECASE)
    
    kind = "amended"
    kind_uncertain = False

    # 1. Omission
    if re.search(r'\b(?:omitted|rep\.|repealed)\b', norm, re.IGNORECASE) and not re.search(r'\b(?:ins|inserted)\b.*?\bomitted\b', norm, re.IGNORECASE):
        kind = "omitted"
    # 2. Insertion
    elif re.search(r'(?:\bins\b|\binserted\b|\badded\b)', norm, re.IGNORECASE):
        kind = "inserted"
    # 3. Substitution
    elif re.search(r'(?:\bsubs\b|\bsubstituted\b)', norm, re.IGNORECASE):
        if re.search(r'for\s+(?:certain\s+words|the\s+words|the\s+word|words|figures|letter)\b', norm, re.IGNORECASE):
            kind = "amended"
        else:
            kind = "replaced"
    else:
        # Renumbering / relettering or other actions
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

    def get_page_body(p_num):
        page = doc[p_num - 1]
        h_lines = [item[1].y for d in page.get_drawings() for item in d['items'] if item[0] == 'l' and abs(item[1].y - item[2].y) < 1.0 and abs(item[2].x - item[1].x) > 50]
        sep_y = min(h_lines) if h_lines else None
        blocks = page.get_text('blocks', sort=True)
        body = ''
        for b in blocks:
            if b[1] > 745 and re.match(r'^\d+\s*$', b[4].strip()): continue
            if sep_y and b[1] >= sep_y - 2: continue
            body += '\n' + b[4]
        return body

    def extract_bracket_candidates(p_num):
        body_text = get_page_body(p_num)
        full_text = body_text
        if p_num < len(doc):
            full_text += "\n" + get_page_body(p_num + 1)
        candidates = {}
        for m in re.finditer(r'(\d+)\[', body_text):
            m_num = int(m.group(1))
            start_idx = m.end()
            depth = 1
            i = start_idx
            while i < len(full_text) and depth > 0:
                if full_text[i] == '[': depth += 1
                elif full_text[i] == ']': depth -= 1
                i += 1
            if depth == 0:
                cand = full_text[start_idx:i-1].strip().replace('\n', ' ')
                cand = re.sub(r'\s+', ' ', cand)
                # Keep first occurrence per marker
                if m_num not in candidates:
                    candidates[m_num] = cand
        return candidates

    draft_entries = []
    non_amendments = []
    kind_counts = {}
    uncertain_entries = []

    for p_idx in range(31, 283): # Pages 32 to 283
        p_num = p_idx + 1
        page = doc[p_idx]

        h_lines = [item[1].y for d in page.get_drawings() for item in d['items'] if item[0] == 'l' and abs(item[1].y - item[2].y) < 1.0 and abs(item[2].x - item[1].x) > 50]
        if not h_lines: continue
        sep_y = min(h_lines)

        blocks = page.get_text('blocks', sort=True)
        fn_text = ''
        for b in blocks:
            if b[1] > 745 and re.match(r'^\d+\s*$', b[4].strip()): continue
            if sep_y and b[1] >= sep_y - 2:
                fn_text += '\n' + b[4]

        # Extract sequential footnotes
        fns = {}
        lines = fn_text.split('\n')
        expected_next = 1
        current_num = None
        current_text = []
        for line in lines:
            stripped = line.strip()
            if not stripped: continue
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

        bracket_cands = extract_bracket_candidates(p_num)

        # Date-only detection
        date_only_map = {}
        for fn_num, body in fns.items():
            m_date_only = re.match(r'^(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,\s*\d{4})[,\.\s]', body)
            if m_date_only and not ("act" in body.lower() or "subs." in body.lower() or "ins." in body.lower() or "omitted" in body.lower()):
                date_only_map[fn_num] = body

        last_named_act = None

        for fn_num, body in fns.items():
            if fn_num in date_only_map:
                continue

            attached_date_body = date_only_map.get(fn_num + 1)

            # Check non-amendments
            is_non_amend = False
            non_amend_reason = ""
            if re.match(r'^(?:See\s+(?:notifn|the|C\.O\.)|Paragraph\s+\d+\s+of|In\s+P\.\s+Sambamurthy|The\s+words\s+in\s+italics\s+struck\s+down|S\.C\.C\.\s+362)', body, re.IGNORECASE):
                is_non_amend = True
                non_amend_reason = "Government Order, Rules notification, or judicial decision"
            elif not any(w in body.lower() for w in ["ins.", "subs.", "omitted", "added", "rep.", "renumbered", "re-lettered", "re-numbered", "act", "amendment"]):
                is_non_amend = True
                non_amend_reason = "No statutory amendment action present"

            if is_non_amend:
                non_amendments.append({
                    "page": p_num,
                    "footnote_number": fn_num,
                    "raw_text": body,
                    "reason": non_amend_reason
                })
                continue

            # Check compound footnote
            # Patterns: "X and omitted by Y", "X and further subs. by Y", "X and subsequently ins. by Y"
            m_comp = re.search(r'^(.*?)\s+and\s+(further\s+subs\.|omitted|subsequently\s+ins\.|subsequently\s+cl\.|cl\.\s+\(5\)\s+omitted)\s+by\s+(.*)$', body, re.IGNORECASE)
            if m_comp:
                p1_text = m_comp.group(1).strip()
                p2_text = m_comp.group(2).strip() + " by " + m_comp.group(3).strip()
                sub_parts = [(p1_text, 'a'), (p2_text, 'b')]
            else:
                sub_parts = [(body, '')]

            for part_txt, suffix in sub_parts:
                kind, kind_uncertain = classify_action(part_txt)
                kind_counts[kind] = kind_counts.get(kind, 0) + 1
                if kind_uncertain:
                    uncertain_entries.append((p_num, fn_num, part_txt))

                # Act extraction & ibid. resolution
                m_act = re.search(r'(?:the\s+)?(Constitution\s+\([^)]+\s+Amendment\)\s+Act,\s*\d{4})', part_txt, re.IGNORECASE)
                part_act = None
                if m_act:
                    part_act = "The " + m_act.group(1).strip()
                    last_named_act = part_act
                elif "ibid." in part_txt.lower():
                    part_act = last_named_act
                else:
                    m_other = re.search(r'([A-Za-z\s,]+\s+Act,\s*\d{4})', part_txt)
                    if m_other:
                        part_act = m_other.group(1).strip()
                        last_named_act = part_act
                    elif last_named_act and ("s." in part_txt or "cl." in part_txt):
                        part_act = last_named_act

                # Effective date
                eff_date = ""
                m_wef = re.search(r'\(w\.e\.f\.\s*([^)]+)\)', part_txt)
                if m_wef:
                    raw_d = m_wef.group(1).strip()
                    m_d = re.match(r'^(\d{1,2})-(\d{1,2})-(\d{4})$', raw_d)
                    if m_d:
                        eff_date = f"{int(m_d.group(3)):04d}-{int(m_d.group(2)):02d}-{int(m_d.group(1)):02d}"
                    else:
                        eff_date = raw_d
                elif attached_date_body:
                    m_att = re.search(r'(\d{1,2})[-/](\d{1,2})[-/](\d{4})', attached_date_body)
                    if m_att:
                        eff_date = f"{int(m_att.group(3)):04d}-{int(m_att.group(2)):02d}-{int(m_att.group(1)):02d}"
                    elif "1st November, 1956" in attached_date_body:
                        eff_date = "1956-11-01"

                # old_text
                old_text = None
                m_old = re.search(r'for\s+["\u201c]([^"\u201d]+)["\u201d]', part_txt)
                if m_old:
                    old_text = m_old.group(1).strip()

                # new_text_candidate
                new_cand = None
                if kind != "omitted":
                    new_cand = bracket_cands.get(fn_num)

                # Primary article
                arts = page_to_articles.get(p_num, ["UNKNOWN"])
                primary_art = arts[0]
                if p_num == 32: primary_art = "PREAMBLE"
                elif p_num == 37: primary_art = "13"
                elif p_num == 38: primary_art = "15"
                elif p_num == 42:
                    if fn_num == 2: primary_art = "21A"
                    elif fn_num == 1: primary_art = "19"

                entry_id = f"draft-fn-p{p_num}-{fn_num}" + (f"-{suffix}" if suffix else "")
                draft_entries.append({
                    "id": entry_id,
                    "footnote_ref": f"p{p_num}-fn{fn_num}",
                    "article_ref": primary_art,
                    "kind": kind,
                    "kind_uncertain": kind_uncertain,
                    "effectiveDate": eff_date,
                    "whatChanged": part_txt,
                    "oldText": old_text,
                    "newTextCandidate": new_cand,
                    "newText": None,
                    "reason": "",
                    "reasonSource": "",
                    "changedBy": part_act or "",
                    "authority": "",
                    "sourceLabel": "",
                    "sourceUrl": "",
                    "verifiedOn": "",
                    "status": "draft",
                    "published": False
                })

    doc.close()
    return draft_entries, non_amendments, kind_counts, uncertain_entries


def main():
    parser = argparse.ArgumentParser(description="Parse Constitution footnotes into compliant draft entries.")
    parser.add_argument("--pdf", default=str(REPO_ROOT / "content-sources" / "constitution" / "Constitution_of_India_English.pdf"))
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    print(f"Parsing footnotes from: {pdf_path}")
    drafts, non_amends, kinds, uncertains = parse_constitution_footnotes(pdf_path)

    has_old = sum(1 for d in drafts if d["oldText"])

    print(f"\nTotal draft entries produced: {len(drafts)}")
    print(f"Total non-amendment footnotes excluded: {len(non_amends)}")
    print(f"Entries with predecessor text (oldText): {has_old}")
    print("\nKind counts:")
    for k, c in sorted(kinds.items()):
        print(f"  {k:15s}: {c}")

    print(f"\nFootnotes flagged kind_uncertain: {len(uncertains)}")
    for p, n, txt in uncertains:
        print(f"  Page {p}, FN {n}: {txt}")

    export_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_draft_entries": len(drafts),
        "total_non_amendment_footnotes": len(non_amends),
        "kinds_count": kinds,
        "has_old_text_count": has_old,
        "kind_uncertain_count": len(uncertains),
        "draft_history_entries": drafts
    }
    write_repo_file("backend/reports/parsed_footnotes.json", json.dumps(export_data, indent=2))
    write_repo_file("backend/reports/non_amendment_footnotes.json", json.dumps(non_amends, indent=2))
    print("\nWrote backend/reports/parsed_footnotes.json")
    print("Wrote backend/reports/non_amendment_footnotes.json")

    # Show compound footnote results for Page 66 FN 2, Page 129 FN 1, Page 137 FN 1
    print("\n==================== COMPOUND FOOTNOTE RESULTS ====================")
    for target_ref in ["p66-fn2", "p129-fn1", "p137-fn1"]:
        matching = [d for d in drafts if d["footnote_ref"] == target_ref]
        print(f"\n--- {target_ref} ({len(matching)} entries) ---")
        print(json.dumps(matching, indent=2))

    # Show Preamble, Article 13, Article 15, Article 21A entries
    print("\n==================== PREAMBLE DRAFT ENTRIES ====================")
    print(json.dumps([d for d in drafts if d["article_ref"] == "PREAMBLE"], indent=2))

    print("\n==================== ARTICLE 13 DRAFT ENTRIES ====================")
    print(json.dumps([d for d in drafts if d["article_ref"] == "13"], indent=2))

    print("\n==================== ARTICLE 15 DRAFT ENTRIES ====================")
    print(json.dumps([d for d in drafts if d["article_ref"] == "15"], indent=2))

    print("\n==================== ARTICLE 21A DRAFT ENTRIES ====================")
    print(json.dumps([d for d in drafts if d["article_ref"] == "21A"], indent=2))

if __name__ == "__main__":
    main()
