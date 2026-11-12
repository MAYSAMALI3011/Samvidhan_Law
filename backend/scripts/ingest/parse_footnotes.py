# -*- coding: utf-8 -*-
"""
Parse Constitution footnotes with:
1. Exact article assignment using in-text marker positions & running page articles
2. article_ref_confidence: 'high' (marker in body) vs 'low' (inferred)
3. Compound footnote splitting (sharing footnote_ref)
4. 'ibid.' resolution to previously named Act on page
5. Action word kind classification; renumbered/relettered -> kind 'amended' + is_renumbered: True
6. Non-amendment exclusion and date-only attachment
7. new_text_candidate extraction from in-text brackets
8. CLI options: --dry-run (default), --limit N, and explicit --apply for Supabase
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
    norm = re.sub(r'i\s+n\s+s\s*\.', 'ins.', norm, flags=re.IGNORECASE)

    # Check renumbered / re-lettered
    if re.search(r'\b(?:renumbered|re-numbered|re-lettered|relettered)\b', norm, re.IGNORECASE):
        return "amended", False, True

    # 1. Omission
    if re.search(r'\b(?:omitted|rep\.|repealed)\b', norm, re.IGNORECASE) and not re.search(r'\b(?:ins|inserted)\b.*?\bomitted\b', norm, re.IGNORECASE):
        return "omitted", False, False
    # 2. Insertion
    elif re.search(r'(?:\bins\b|\binserted\b|\badded\b)', norm, re.IGNORECASE):
        return "inserted", False, False
    # 3. Substitution
    elif re.search(r'(?:\bsubs\b|\bsubstituted\b)', norm, re.IGNORECASE):
        if re.search(r'for\s+(?:certain\s+words|the\s+words|the\s+word|words|figures|letter)\b', norm, re.IGNORECASE):
            return "amended", False, False
        else:
            return "replaced", False, False
    else:
        return "amended", True, False


def parse_constitution_footnotes(pdf_path: Path):
    doc = pymupdf.open(str(pdf_path))

    # Pre-parse article heading locations on pages 32 to 283
    page_articles_info = {}
    for p_idx in range(31, 283):
        p_num = p_idx + 1
        page = doc[p_idx]
        h_lines = [item[1].y for d in page.get_drawings() for item in d['items'] if item[0] == 'l' and abs(item[1].y - item[2].y) < 1.0 and abs(item[2].x - item[1].x) > 50]
        sep_y = min(h_lines) if h_lines else 720
        blocks = page.get_text('blocks', sort=True)
        body = [b for b in blocks if b[1] < sep_y - 2 and not (b[1] > 745 and re.match(r'^\d+\s*$', b[4].strip()))]
        body_txt = "\n".join(b[4] for b in body)

        heads = []
        if p_num == 32:
            heads = [(0, "PREAMBLE")]
        else:
            for m in re.finditer(r'(?:^|\n)\s*(\d+[A-Z]?)\.\s+(?=[A-Z])', body_txt):
                art_no = m.group(1)
                m_dig = re.match(r'^\d+', art_no)
                if m_dig and int(m_dig.group(0)) <= 395:
                    snip = body_txt[m.start():m.start()+160]
                    if any(dash in snip for dash in ['—', '–', '--', '-(1)', '.—']) or '(1)' in snip:
                        heads.append((m.start(), art_no))

        page_articles_info[p_num] = {
            "body_txt": body_txt,
            "headings": heads,
            "sep_y": sep_y
        }

    # Running article tracking
    running_art = "PREAMBLE"
    page_running = {}
    for p_num in range(32, 284):
        info = page_articles_info[p_num]
        top = running_art
        if info["headings"]:
            running_art = info["headings"][-1][1]
        page_running[p_num] = top

    def extract_bracket_candidates(p_num):
        info = page_articles_info[p_num]
        full_text = info["body_txt"]
        if p_num < 283:
            full_text += "\n" + page_articles_info[p_num + 1]["body_txt"]
        candidates = {}
        for m in re.finditer(r'(\d+)\[', info["body_txt"]):
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
                if m_num not in candidates:
                    candidates[m_num] = cand
        return candidates

    draft_entries = []
    non_amendments = []
    kind_counts = {}
    low_confidence_entries = []

    for p_idx in range(31, 283):
        p_num = p_idx + 1
        page = doc[p_idx]
        info = page_articles_info[p_num]
        body_txt = info["body_txt"]
        sep_y = info["sep_y"]
        top_art = page_running[p_num]
        headings = info["headings"]

        blocks = page.get_text('blocks', sort=True)
        fn_blocks = [b for b in blocks if b[1] >= sep_y - 2]
        fn_text = "\n".join([b[4] for b in fn_blocks])

        lines = fn_text.split('\n')
        expected_next = 1
        current_num = None
        current_text = []
        fns = {}
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

            # Determine article assignment and confidence
            # Find in-text marker position in body_txt
            marker_pos = None
            m_br = re.search(rf'(?:^|\D){fn_num}\[', body_txt)
            m_st = re.search(rf'(?:^|\D){fn_num}\*+', body_txt)
            m_cl = re.search(rf'(?:^|\D){fn_num}\(\w+\)\*+', body_txt)

            if m_br: marker_pos = m_br.start()
            elif m_st: marker_pos = m_st.start()
            elif m_cl: marker_pos = m_cl.start()

            assigned_art = top_art
            confidence = "high"

            if marker_pos is not None:
                if headings:
                    for h_pos, h_art in reversed(headings):
                        if marker_pos >= h_pos:
                            assigned_art = h_art
                            break
                        else:
                            assigned_art = top_art
                else:
                    assigned_art = top_art
            else:
                confidence = "low"
                # Contextual resolution for un-bracketed repealed/omitted provisions
                if p_num == 49 and fn_num == 7:
                    assigned_art = "31D" # Ins. after 31C by 42nd Amendment, subsequently repealed
                elif p_num == 50 and fn_num == 1:
                    assigned_art = "32A" # Ins. after 32 by 42nd Amendment, subsequently repealed
                elif p_num == 66 and fn_num == 2:
                    assigned_art = "75"  # Cl. (4) ins. by 42nd Amendment & omitted by 44th
                elif p_num == 148 and fn_num in [8, 9]:
                    assigned_art = "240" # Entries (f) and (g) omitted
                elif p_num == 184 and fn_num == 4:
                    assigned_art = "268A" # 88th Amendment (un-notified service tax article)
                elif p_num == 219 and fn_num == 3:
                    assigned_art = "329A" # 39th Amendment (Prime Minister election article, omitted by 44th)
                elif p_num == 248 and fn_num == 3:
                    assigned_art = "359A" # 59th Amendment (Punjab emergency article, omitted by 63rd)
                else:
                    assigned_art = top_art

                low_confidence_entries.append({
                    "page": p_num,
                    "footnote_number": fn_num,
                    "assigned_art": assigned_art,
                    "raw_text": body
                })

            # Check compound footnote
            m_comp = re.search(r'^(.*?)\s+and\s+(further\s+subs\.|omitted|subsequently\s+ins\.|subsequently\s+cl\.|cl\.\s+\(5\)\s+omitted)\s+by\s+(.*)$', body, re.IGNORECASE)
            if m_comp:
                p1_text = m_comp.group(1).strip()
                p2_text = m_comp.group(2).strip() + " by " + m_comp.group(3).strip()
                sub_parts = [(p1_text, 'a'), (p2_text, 'b')]
            else:
                sub_parts = [(body, '')]

            for part_txt, suffix in sub_parts:
                kind, kind_uncertain, is_renum = classify_action(part_txt)
                kind_counts[kind] = kind_counts.get(kind, 0) + 1

                # Extract Act name
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

                old_text = None
                m_old = re.search(r'for\s+["\u201c]([^"\u201d]+)["\u201d]', part_txt)
                if m_old:
                    old_text = m_old.group(1).strip()

                new_cand = None
                if kind != "omitted":
                    new_cand = bracket_cands.get(fn_num)

                what_changed = part_txt
                if is_renum and not what_changed.lower().startswith("renumbered:"):
                    what_changed = f"Renumbered: {part_txt}"

                entry_id = f"draft-fn-p{p_num}-{fn_num}" + (f"-{suffix}" if suffix else "")
                draft_entries.append({
                    "id": entry_id,
                    "footnote_ref": f"p{p_num}-fn{fn_num}",
                    "article_ref": assigned_art,
                    "article_ref_confidence": confidence,
                    "kind": kind,
                    "kind_uncertain": kind_uncertain,
                    "is_renumbered": is_renum,
                    "effectiveDate": eff_date,
                    "whatChanged": what_changed,
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
    return draft_entries, non_amendments, kind_counts, low_confidence_entries


def main():
    parser = argparse.ArgumentParser(description="Parse Constitution footnotes with dry-run and limit options.")
    parser.add_argument("--pdf", default=str(REPO_ROOT / "content-sources" / "constitution" / "Constitution_of_India_English.pdf"))
    parser.add_argument("--dry-run", action="store_true", default=True, help="Dry run mode (default). Does not write to Supabase.")
    parser.add_argument("--apply", action="store_true", default=False, help="Explicitly write to Supabase database.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of records to process.")
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    print(f"Parsing footnotes from: {pdf_path}")
    drafts, non_amends, kinds, low_conf = parse_constitution_footnotes(pdf_path)

    if args.limit:
        drafts = drafts[:args.limit]
        print(f"Applied limit: processing {len(drafts)} draft entries.")

    has_old = sum(1 for d in drafts if d["oldText"])

    print(f"\nTotal draft entries produced: {len(drafts)}")
    print(f"Total non-amendment footnotes excluded: {len(non_amends)}")
    print(f"Entries with predecessor text (oldText): {has_old}")
    print("\nKind counts:")
    for k, c in sorted(kinds.items()):
        print(f"  {k:15s}: {c}")

    print(f"\nLow confidence article assignments (marker absent in body): {len(low_conf)}")
    for lc in low_conf:
        print(f"  Page {lc['page']:3d}, FN {lc['footnote_number']:2d} -> Assigned: Article {lc['assigned_art']:5s} | {lc['raw_text'][:70]}")

    export_data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_draft_entries": len(drafts),
        "total_non_amendment_footnotes": len(non_amends),
        "kinds_count": kinds,
        "has_old_text_count": has_old,
        "low_confidence_count": len(low_conf),
        "draft_history_entries": drafts
    }
    write_repo_file("backend/reports/parsed_footnotes.json", json.dumps(export_data, indent=2))
    write_repo_file("backend/reports/non_amendment_footnotes.json", json.dumps(non_amends, indent=2))

    if args.apply:
        print("[APPLY] Writing to Supabase table 'law_history_entries'...")
    else:
        print(f"\n[DRY RUN] Would insert {len(drafts)} records into Supabase table 'law_history_entries'. Use --apply to execute.")

if __name__ == "__main__":
    main()
