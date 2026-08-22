const fs = require("fs");
const path = require("path");

async function test() {
  const pdfPath = path.join(__dirname, "../demo-assets/Keshav_Demo_Transcript.pdf");
  const pdfBuf = fs.readFileSync(pdfPath);

  const formData = new FormData();
  formData.append("document", new Blob([pdfBuf], { type: "application/pdf" }), "Keshav_Demo_Transcript.pdf");
  formData.append("studentName", "Keshav Demo");
  formData.append("registerNumber", "VIT2026DEMO");
  formData.append("programme", "B.Tech Electronics and Communication Engineering");
  formData.append("cgpa", "8.90");

  const res = await fetch("http://localhost:4000/api/credentials/issue", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log("Issue API Result:", JSON.stringify(data, null, 2));

  // Now test verify
  const verifyRes = await fetch("http://localhost:4000/api/credentials/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentialId: data.data.credentialId, demoModeType: "original" })
  });

  const verifyData = await verifyRes.json();
  console.log("\nVerify API Result:", JSON.stringify(verifyData, null, 2));
}

test().catch(console.error);
