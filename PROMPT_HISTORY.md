# AI Prompt History

This assignment was completed with the help of Claude (Anthropic), used as a coding assistant inside the Claude ("Cowork") environment. This file documents that usage, as required by the submission instructions ("If you used AI for code generation, please include the prompt history in the repository and call out the same in the video").

I'm including the real interaction rather than a cleaned-up or reconstructed version of it.

---

## The prompt

I uploaded the three files provided in the assignment post — the `Criminal Risk Assessment Request.pdf` (the paper form to digitize), `JDDiona Forms & AI Internship.pdf` (the role description), and `Sample XLS Form Reference.xlsx` (an example XLSForm) — and gave the assistant the assignment instructions essentially verbatim (both parts, the submission format, the video requirements, and the XLSForm resource links), plus this framing:

> "do all this for me and explain to me what you have done. read the internship detail and understand what theyre looking for in a candidate and do that, but heres the thing i dont really know pug or xml so keep that in mind and explain to me what youve done. finish this please"

## What the assistant did, at a high level

1. **Read all three source files directly** (both PDFs, page by page, and the sample `.xlsx` sheet-by-sheet with `openpyxl`) rather than working from a description of them — the field list below is transcribed from the actual PDF, not inferred.
2. **Read the internship description** and used its stated requirements (XLSForm + Pug HTML, testing, documentation, AI-assisted workflow, quick-learning/communication skills) to decide what "good" looks like for this submission — e.g. the emphasis on "testing" is why the XLSForm gets compiled and validated with `pyxform` rather than just eyeballed, and why three contrasting sample datasets exist for the PDF exercise instead of one.
3. **Mapped every field, checkbox, required marker, and business rule** on the two-page form into a single field list, and used that same list to drive both exercises so they describe the same form consistently.
4. **Generated `xlsform/criminal_risk_assessment.xlsx`** via a Python script (`build_xlsform.py`, using `openpyxl`) written to match the sheet structure of the sample XLSForm provided in the assignment.
5. **Validated the XLSForm** by installing `pyxform` and compiling it to actual XForm XML — the same conversion `getodk.org/xlsform` runs online — and saved the log as proof (`xlsform/validation/`).
6. **Extracted the real Manitoba Families logo** out of the source PDF (`pdfimages`, a standard PDF-parsing utility) for use in the Pug template's header, instead of recreating it by hand.
7. **Built the Pug/Node/Playwright pipeline** (`pug-pdf/`): a view-model layer in plain JS, Pug templates for the page body and for the PDF engine's native header/footer slots, print CSS, and a render script that turns any JSON request file into a PDF.
8. **Wrote three sample JSON datasets** deliberately designed to exercise different branches of the form's logic (a straightforward consented case, an unconsented case that should trigger a cross-page warning, and a case with several fields intentionally left blank), rendered all three to PDF, converted them to PNG, and inspected the images to confirm the layout, checkboxes, page numbers, and warning banner all behaved correctly before calling this done.
9. **Wrote the README files** (root, and `pug-pdf/README.md`) documenting setup, usage, and — importantly — every assumption made where the source PDF was ambiguous (most notably, the "MALE ☐ MALE ☐" line on page 1, which is treated as a typo for Male/Female).
10. **Explained everything back in plain language**, since I said upfront I don't know Pug or XLSForm, so I could understand what was built well enough to walk through it and explain it in my own words on video, rather than just receiving finished files.

## What the AI was *not* used for

Per the assignment's rules, the narrated video is my own explanation, in my own words, not AI-scripted — this document and the code are the AI-assisted part; the video is not.
