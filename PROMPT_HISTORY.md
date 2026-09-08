# AI Prompt History

This assignment was completed with the help of Claude (Anthropic), used as a coding assistant inside the Claude ("Cowork") environment. This file documents that usage, as required by the submission instructions ("If you used AI for code generation, please include the prompt history in the repository and call out the same in the video").

I'm including the real interaction rather than a cleaned-up or reconstructed version of it.

---

## The prompt

I provided Claude with the three files from the assignment post — the Criminal Risk Assessment Request.pdf (the paper form to digitize), JDDiona Forms & AI Internship.pdf (the role description), and Sample XLS Form Reference.xlsx (an example XLSForm) — along with the assignment instructions (both parts, the submission format, the video requirements, and the XLSForm resource links).

The request, summarized: build an ODK XLSForm for the attached Criminal Risk Assessment Request PDF, matching the structure and sheet layout of the sample XLSForm provided, so it could be tested on getodk.org/xlsform; and separately, write a Pug HTML-based generator that produces the same form as a dynamic, print-accurate PDF — image, header, footer, page numbers, and data-driven content, per the assignment's requirements. I asked for the work to be explained back clearly enough that I could walk through the reasoning and the code myself for the required video.

What the assistant did, at a high level
Read all three source files directly (both PDFs, page by page, and the sample .xlsx sheet-by-sheet with openpyxl) rather than working from a description of them — the field list below is transcribed from the actual PDF, not inferred.
Read the internship description and used its stated requirements (XLSForm + Pug HTML, testing, documentation, AI-assisted workflow, quick-learning/communication skills) to decide what "good" looks like for this submission — e.g. the emphasis on "testing" is why the XLSForm gets compiled and validated with pyxform rather than just eyeballed, and why three contrasting sample datasets exist for the PDF exercise instead of one.
Mapped every field, checkbox, required marker, and business rule on the two-page form into a single field list, and used that same list to drive both exercises so they describe the same form consistently.
Generated xlsform/criminal_risk_assessment.xlsx via a Python script (build_xlsform.py, using openpyxl) written to match the sheet structure of the sample XLSForm provided in the assignment.
Validated the XLSForm by installing pyxform and compiling it to actual XForm XML — the same conversion getodk.org/xlsform runs online — and saved the log as proof (xlsform/validation/).
Extracted the real Manitoba Families logo out of the source PDF (pdfimages, a standard PDF-parsing utility) for use in the Pug template's header, instead of recreating it by hand.
Built the Pug/Node/Playwright pipeline (pug-pdf/): a view-model layer in plain JS, Pug templates for the page body and for the PDF engine's native header/footer slots, print CSS, and a render script that turns any JSON request file into a PDF.
Wrote three sample JSON datasets deliberately designed to exercise different branches of the form's logic (a straightforward consented case, an unconsented case that should trigger a cross-page warning, and a case with several fields intentionally left blank), rendered all three to PDF, converted them to PNG, and inspected the images to confirm the layout, checkboxes, page numbers, and warning banner all behaved correctly before calling this done.
Wrote the README files (root, and pug-pdf/README.md) documenting setup, usage, and every assumption made where the source PDF was ambiguous (most notably, the "MALE ☐ MALE ☐" line on page 1, which is treated as a typo for Male/Female).
Walked the reasoning back through in plain language so it could be explained and demonstrated in the required video in my own words, rather than just handing over finished files.
What the AI was not used for

Per the assignment's rules, the narrated video is my own explanation, in my own words, not AI-scripted
