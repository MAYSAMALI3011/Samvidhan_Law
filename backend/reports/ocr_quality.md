# Content Sources: OCR Quality & Scan Analysis Report (Phase B3)

**Generated:** 2026-11-12 05:47:45 UTC  
**Total Scanned Documents Evaluated:** 20  
**Absolute Content Rule Notice:** All text extracted from `ocr` files is restricted to `draft/unverified` status. No OCR-only or unconfirmed text is served on public endpoints or used in chatbot grounding until confirmed against legislative.gov.in.  

---

## 1. Document-by-Document Scan & OCR Quality Audit

| Document File Path | Pages | Total Chars | Avg Chars/Page | Scan Layer Status | Quality Assessment |
|---|---|---|---|---|---|
| `content-sources/amendment_acts/003_3rd_Amendment_Act_1954_SCAN_DUPLICATE.pdf` | 2 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/066_66th_Amendment_Act_1990_SCAN.pdf` | 4 | 7404 | 1851.0 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/amendment_acts/069_69th_Amendment_Act_1991_SCAN.pdf` | 3 | 7375 | 2458.3 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/amendment_acts/072_72nd_Amendment_Act_1992_SCAN.pdf` | 2 | 2637 | 1318.5 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/amendment_acts/075_75th_Amendment_Act_1993_SCAN.pdf` | 2 | 2264 | 1132.0 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/amendment_acts/094_94th_Amendment_Act_2006_SCAN.pdf` | 1 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/096_96th_Amendment_Act_2011_SCAN.pdf` | 1 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/097_97th_Amendment_Act_2011_SCAN.pdf` | 5 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/098_98th_Amendment_Act_2012_SCAN.pdf` | 2 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/101_101st_Amendment_Act_2016_SCAN.pdf` | 6 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/102_102nd_Amendment_Act_2018_SCAN.pdf` | 3 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/103_103rd_Amendment_Act_2019_SCAN.pdf` | 2 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/amendment_acts/105_105th_Amendment_Act_2021_SCAN.pdf` | 2 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/preamble/Preamble_scan_1.pdf` | 1 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/preamble/Preamble_scan_2.pdf` | 1 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |
| `content-sources/statements_of_objects_and_reasons/SOR_Art164_proviso.pdf` | 1 | 1755 | 1755.0 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/statements_of_objects_and_reasons/SOR_Art334_reservation.pdf` | 1 | 1606 | 1606.0 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/statements_of_objects_and_reasons/SOR_Odia_Eighth_Schedule.pdf` | 1 | 855 | 855.0 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/statements_of_objects_and_reasons/SOR_cooperative_societies.pdf` | 2 | 4791 | 2395.5 | Degraded scan OCR text layer | Fair / degraded typography |
| `content-sources/statements_of_objects_and_reasons/SOR_entry33_List3.pdf` | 1 | 0 | 0.0 | Pure image (no text layer) | Awaiting OCR |

---

## 2. Key Findings & Breakdown

- **Pure Image Scans (0 embedded characters)**: 12 files. (e.g. Acts 94, 96, 97, 98, 101, 102, 103, 105, Act 3 duplicate, SOR Entry 33, Preamble scans 1 & 2). These require full optical character recognition.
- **Degraded Scan OCR Layers**: 8 files. Specifically, Acts 66, 69, 72, and 75 contain embedded OCR layers with noticeable character distortions (e.g. `@he Gaiettz of gndifa`, `PART Il—saeﬂm 1`, `U’ZIAGRAHAYANA 13, 1914`).
- **Safeguard**: Operative amendatory provisions from these files are gated behind human review flags in `source_documents`.

---

## 3. Recommended Remediation Plan for Owner

1. Replace pure scans with modern digital PDF gazettes from `egazette.gov.in` where available.
2. For historical gazettes without digital editions (such as Acts 66, 69, 72, 75), run high-resolution Tesseract OCR with legal lexicon dictionaries or transcribe operative section text under human verification.
