# Constitution of India: Ingestion & Verification Report (Phase B2)

**Generated:** 2026-11-12 07:30:08 UTC  
**Source Document:** `content-sources/constitution/Constitution_of_India_English.pdf`  
**Verification Status:** unverified (source cataloged, pending gazette verification)  
**Edition:** English pocket edition incorporating amendments up to the 106th Amendment Act, 2023.  

---

## 1. Summary Statistics

| Metric | Value |
|---|---|
| **Total Articles Parsed** | **506** |
| **Total Clauses & Subclauses** | **899** |
| **Total Database Provisions** | **1406** |
| **Articles in Table of Contents** | **506** |
| **TOC Match Rate** | **100.0%** |
| **Articles with Footnotes Extracted** | **290** |
| **Warnings / Anomalies** | **0** |

---

## 2. Articles Breakdown by Part (Authoritative Table of Contents Assignment)

| Part | Title | Article Count |
|---|---|---|
| Part I | THE UNION AND ITS TERRITORY | 5 |
| Part II | CITIZENSHIP | 7 |
| Part III | FUNDAMENTAL RIGHTS | 30 |
| Part IV | DIRECTIVE PRINCIPLES OF STATE POLICY | 20 |
| Part IVA | FUNDAMENTAL DUTIES | 1 |
| Part IX | THE PANCHAYATS | 16 |
| Part IXA | THE MUNICIPALITIES | 18 |
| Part IXB | THE CO-OPERATIVE SOCIETIES | 13 |
| Part V | THE UNION | 107 |
| Part VI | THE STATES | 90 |
| Part VII | THE STATES IN PART B OF THE FIRST SCHEDULE (Omitted) | 1 |
| Part VIII | THE UNION TERRITORIES | 8 |
| Part X | THE SCHEDULED AND TRIBAL AREAS | 2 |
| Part XI | RELATIONS BETWEEN THE UNION AND THE STATES | 22 |
| Part XII | FINANCE, PROPERTY, CONTRACTS AND SUITS | 42 |
| Part XIII | TRADE, COMMERCE AND INTERCOURSE WITHIN THE TERRITORY OF INDIA | 7 |
| Part XIV | SERVICES UNDER THE UNION AND THE STATES | 17 |
| Part XIVA | TRIBUNALS | 2 |
| Part XIX | MISCELLANEOUS | 10 |
| Part XV | ELECTIONS | 7 |
| Part XVI | SPECIAL PROVISIONS RELATING TO CERTAIN CLASSES | 19 |
| Part XVII | OFFICIAL LANGUAGE | 11 |
| Part XVIII | EMERGENCY PROVISIONS | 10 |
| Part XX | AMENDMENT OF THE CONSTITUTION | 1 |
| Part XXI | TEMPORARY, TRANSITIONAL AND SPECIAL PROVISIONS | 36 |
| Part XXII | SHORT TITLE, COMMENCEMENT, AUTHORITATIVE TEXT IN HINDI AND REPEALS | 4 |

---

## 3. Discrepancy Analysis: The 6 Articles from Initial Report

In the initial Phase B2 ingestion report, 482 articles were parsed and 476 matched in the initial TOC parse (diff: 6 articles). Analysis of the PDF layout revealed why those 6 articles were initially flagged:

1. **Preamble**: Formatted before Part I in the Constitution; ingested as a foundational provision but has no article number.
2. **Article 238 (Part VII)**: Omitted by the 7th Amendment Act, 1956. Has no body text in the PDF, but is retained in the Table of Contents under Part VII.
3. **Article 243I**: Typeset in the Table of Contents with a hyphen (`243-I`) to avoid visual confusion with Roman numeral I; body text formats it as `243I`.
4. **Article 243O**: Typeset in the Table of Contents with a hyphen (`243-O`) to avoid visual confusion with digit 0; body text formats it as `243O`.
5. **Article 330A**: Added by the 106th Amendment Act, 2023. Typeset on a continuation line immediately following Article 330 in the Table of Contents.
6. **Article 334A**: Added by the 106th Amendment Act, 2023. Typeset on a continuation line immediately following Article 334 in the Table of Contents.

*(Note: Article 371B had whitespace preceding the dot (`371B .`) in the Table of Contents, and Part IXB (13 articles, 243ZH-243ZT) and Part IXA (18 articles, 243P-243ZG) were resolved through two-letter suffix matching and hyphen normalization).* 

With the updated parser, **all 506 articles match the Table of Contents with 100% precision**.

---

## 4. Verification & Content Integrity

All provisions are marked as `unverified` pending independent confirmation against `legislative.gov.in`. No text or history has been generated from memory.
