const { PDFParse } = require("../backend/node_modules/pdf-parse");
const fs = require("fs");
const path = require("path");

async function test() {
  const demoPath = path.join(__dirname, "../demo-assets/Demo_Transcript_Aarav_Sharma.pdf");
  const buffer = fs.readFileSync(demoPath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  console.log("Extracted result type:", typeof result);
  console.log("Extracted result:\n", result.text || result);
}

test().catch(console.error);
