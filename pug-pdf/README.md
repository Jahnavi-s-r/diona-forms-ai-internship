# Pug HTML → PDF: Criminal Risk Assessment Request

Regenerates the Manitoba Families "Criminal Risk Assessment Request" as a filled, print-accurate PDF, driven entirely by a JSON data file.

## Setup

```bash
npm install
```

`playwright-core` is used only as a PDF-printing engine (via Chromium's DevTools Protocol) — no browser automation of a real website happens here. The Chromium binary itself is expected at `/opt/pw-browsers/chromium`, or point `CHROMIUM_PATH` at any Chromium/Chrome executable:

```bash
CHROMIUM_PATH=/path/to/chrome npm run render -- src/data/sample-request-1.json
```

On a normal laptop, `npx playwright install chromium` once, then just run `npm run render` — no `CHROMIUM_PATH` needed.

## Usage

```bash
node src/scripts/render.js <path-to-data.json> [output-path.pdf]
```

Examples:

```bash
node src/scripts/render.js src/data/sample-request-1.json
node src/scripts/render.js src/data/sample-request-2.json output/avery-boulanger.pdf
```

Three sample data files are provided — see the comment in each (`_description`) for what it's meant to demonstrate:

| File | Consent | Reason | What it shows |
|---|---|---|---|
| `sample-request-1.json` | Consented | Place of Safety | Everything lines up — no warning |
| `sample-request-2.json` | Unconsented | Kinship/Customary Care | **Triggers the dynamic warning banner** on page 2 |
| `sample-request-3.json` | Consented | Child Protection Concerns | Several optional fields left blank, to prove the layout doesn't break or print "undefined" |

## Design decisions / assumptions

1. **Header & footer via the PDF engine, not the HTML content.** The letterhead logo and the "Revision date / Page X of Y" footer are passed to Chromium's native `headerTemplate` / `footerTemplate` options rather than being written into the Pug body. This is the standard way to get header/footer/page-numbers that stay correct even if the content reflows onto more physical pages — it's not something the template author has to manage by hand. `pageNumber` / `totalPages` are reserved class names the PDF engine fills in itself; they are not computed by this code.

2. **Business logic lives in JS, not in the template.** `src/scripts/view-model.js` turns the raw request JSON into a flat "view model" — formatted dates, resolved checkbox booleans, the consent/reason cross-check — before it ever reaches Pug. The `.pug` file only ever reads pre-computed booleans/strings. This mirrors how you'd want a real form-rendering service to be structured, and keeps the template itself easy to read even for someone unfamiliar with Pug.

3. **Field 5 (Sex) assumption.** Same call as in the XLSForm: the source PDF's "MALE ☐ MALE ☐" is treated as a typo for Male/Female.

4. **"Two pieces of ID" isn't hard-enforced in the PDF.** The XLSForm enforces it at data-entry time (`constraint`). The PDF is the *output* document, generated after the fact from whatever data it's given — so instead of blocking rendering, it prints a visible warning line if fewer than two ID types are present, which is the appropriate place for that check in an already-submitted document.

5. **Fidelity vs. maintainability.** The layout closely follows the source form's structure, field order, and wording, but this is a hand-rolled CSS layout rather than a pixel-for-pixel trace of the original PDF's exact typography/spacing. Given the assignment's emphasis on dynamic behaviour, testing, and code walkthrough, I prioritized a clean, well-organized template over exact pixel matching.

## Output

Rendered PDFs land in `output/`. Three are committed already (`sample-request-1.pdf`, `-2.pdf`, `-3.pdf`) so the result is visible without installing anything.
