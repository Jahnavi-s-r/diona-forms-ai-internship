/**
 * render.js
 *
 * Turns one JSON "request" file into a PDF that looks like the paper
 * Criminal Risk Assessment Request form, fully populated with that file's
 * data.
 *
 * Usage:
 *   node src/scripts/render.js src/data/sample-request-1.json
 *   node src/scripts/render.js src/data/sample-request-2.json output/custom-name.pdf
 *
 * Pipeline:
 *   1. Pug compiles the form layout + the JSON data into plain HTML.
 *   2. A real headless Chromium (Playwright) loads that HTML and prints it
 *      to PDF, using the browser's own header/footer/page-numbering engine
 *      (this is what makes "Page X of Y" and the repeated logo work
 *      correctly even if the content reflows onto more pages).
 */

const fs = require("fs");
const path = require("path");
const pug = require("pug");
const { chromium } = require("playwright-core");

const { buildViewModel } = require("./view-model");

const VIEWS_DIR = path.join(__dirname, "..", "views");
const STYLES_DIR = path.join(__dirname, "..", "styles");
const ASSETS_DIR = path.join(__dirname, "..", "assets");
const OUTPUT_DIR = path.join(__dirname, "..", "..", "output");

const CHROMIUM_EXECUTABLE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

const REVISION_DATE = "2025-01-10"; // matches the source PDF's own footer

const CONSENT_TEXT =
  "As a person who has, or may have, care, custody, control or charge of a child in receipt of services under " +
  "The Child and Family Services Act, I authorize the Criminal Risk Assessment Unit of Manitoba Families' Child " +
  "Protection Branch (\"CRAU\") to conduct enquiries of the Winnipeg Police Service (WPS), the RCMP and other law " +
  "enforcement agencies necessary to assess the risk that I may endanger the life, health or emotional wellbeing " +
  "of a child. I understand that this information is requested by (CFS Agency) for the purposes of, and in " +
  "accordance with, s. 18.4(1.1) of The Child and Family Services Act, and may include a criminal record, " +
  "criminal and Provincial Act convictions, orders or charges, other involvement/contact with law enforcement " +
  "(including non-conviction information) or other information. I authorize the disclosure of said information " +
  "to CRAU and an authorized Child and Family Services Agency designate or designates. I also authorize the " +
  "disclosure of the personal identifying information set out below to CRAU, the WPS, RCMP and other law " +
  "enforcement agencies for the purpose of completing a Criminal Risk Assessment. I understand that the results " +
  "of this Criminal Risk Assessment are confidential, and may not be provided to me, but may be disclosed in " +
  "accordance with s.76 of the Child and Family Services Act.";

const PAGE2_LEGAL_TEXT =
  "IT IS IMPORTANT THAT THE CFS AGENCY DESIGNATE READS AND UNDERSTANDS THE FOLLOWING: The identifying information " +
  "supplied on page 1 will be researched through the Canadian Police Information Centre (CPIC) and Winnipeg " +
  "Police Service Records Management System (NICHE). The research will NOT include a vulnerable sector search " +
  "or information in respect of pardons, which information may impact the results of a risk assessment. Criminal " +
  "Convictions are strictly confidential and cannot be shared without written authorization of the person " +
  "involved. Personal Information is governed under Section 8 of the Privacy Act (Federal Statute). Record " +
  "information is based on NAME AND DATE OF BIRTH SEARCH ONLY and does not necessarily indicate subject " +
  "involvement. Verification can only be provided through the submission of fingerprints to the local law " +
  "enforcement agency for the area in which the person being assessed resides.";

const FINAL_NOTE_TEXT =
  "NOTE: The assessment completed by the Criminal Risk Assessment Unit of the Department of Families Child " +
  "Protection Branch does not replace a criminal records check.";

function toDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function render(dataFilePath, outputPathArg) {
  const absDataPath = path.resolve(dataFilePath);
  const rawData = JSON.parse(fs.readFileSync(absDataPath, "utf8"));
  const vm = buildViewModel(rawData);

  const cssContent = fs.readFileSync(path.join(STYLES_DIR, "form.css"), "utf8");
  const logoDataUri = toDataUri(path.join(ASSETS_DIR, "manitoba-families-logo.png"));

  const contentHtml = pug.renderFile(path.join(VIEWS_DIR, "criminal-risk-assessment.pug"), {
    vm,
    cssContent,
    consentText: CONSENT_TEXT,
    page2LegalText: PAGE2_LEGAL_TEXT,
    finalNoteText: FINAL_NOTE_TEXT,
  });

  const headerHtml = pug.renderFile(
    path.join(VIEWS_DIR, "partials", "header-template.pug"),
    { logoDataUri }
  );

  const footerHtml = pug.renderFile(
    path.join(VIEWS_DIR, "partials", "footer-template.pug"),
    { revisionDate: REVISION_DATE }
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = outputPathArg
    ? path.resolve(outputPathArg)
    : path.join(OUTPUT_DIR, path.basename(absDataPath, ".json") + ".pdf");

  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROMIUM_EXECUTABLE) ? CHROMIUM_EXECUTABLE : undefined,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(contentHtml, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPath,
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
      margin: { top: "95px", bottom: "55px", left: "40px", right: "40px" },
    });
  } finally {
    await browser.close();
  }

  console.log(`Rendered ${absDataPath} -> ${outputPath}`);
  return outputPath;
}

async function main() {
  const [, , dataArg, outArg] = process.argv;
  if (!dataArg) {
    console.error("Usage: node src/scripts/render.js <data.json> [output.pdf]");
    process.exit(1);
  }
  await render(dataArg, outArg);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { render };
