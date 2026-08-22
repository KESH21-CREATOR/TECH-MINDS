const fs = require("fs");
const path = require("path");

async function runE2ETest() {
  console.log("==================================================");
  console.log("    CredentialChain AI & Web3 Full E2E Test Suite ");
  console.log("==================================================");

  // 1. Health Check
  console.log("\n[1/7] Testing Backend Health & Blockchain Connection...");
  const healthRes = await fetch("http://localhost:4000/api/health");
  const health = await healthRes.json();
  console.log(` Blockchain : ${health.blockchain}`);
  console.log(` Smart Contract : ${health.contractAddress} (Chain ID: ${health.chainId})`);
  if (health.blockchain !== "connected") throw new Error("Blockchain not connected!");

  // 2. Issue a Demo Credential (Aarav Sharma)
  console.log("\n[2/7] Testing Credential Issuance on Ethereum Smart Contract...");
  const pdfPath = path.join(__dirname, "../demo-assets/Demo_Transcript_Aarav_Sharma.pdf");
  const pdfBuf = fs.readFileSync(pdfPath);

  const form = new FormData();
  form.append("document", new Blob([pdfBuf], { type: "application/pdf" }), "Demo_Transcript_Aarav_Sharma.pdf");
  form.append("studentName", "Aarav Sharma");
  form.append("registerNumber", "NIT2026CS101");
  form.append("programme", "B.Tech Computer Science and Engineering");
  form.append("cgpa", "8.72");

  const issueRes = await fetch("http://localhost:4000/api/credentials/issue", {
    method: "POST",
    body: form
  });
  const issueData = await issueRes.json();
  const credId = issueData.data.credentialId;
  console.log(` Credential Issued: ${credId}`);
  console.log(` SHA-256 Digest: 0x${issueData.data.documentHash}`);
  console.log(` Blockchain Tx: ${issueData.data.transactionHash} (Block #${issueData.data.blockNumber})`);

  // 3. Cryptographic Verification: Authentic File (VALID)
  console.log("\n[3/7] Testing Cryptographic Verification: Authentic PDF...");
  const verifyForm = new FormData();
  verifyForm.append("document", new Blob([pdfBuf], { type: "application/pdf" }), "Demo_Transcript_Aarav_Sharma.pdf");
  verifyForm.append("credentialId", credId);

  const verifyRes = await fetch("http://localhost:4000/api/credentials/verify", {
    method: "POST",
    body: verifyForm
  });
  const verifyData = await verifyRes.json();
  console.log(` Verdict: ${verifyData.verdict} (${verifyData.message.slice(0, 40)}...)`);
  console.log(` Hashes Match: ${verifyData.details?.hashesMatch}`);
  if (verifyData.verdict !== "VALID") throw new Error("Expected VALID verdict!");

  // 4. AI Explanation for VALID Result
  console.log("\n[4/7] Testing AI Verdict Explanation (VALID)...");
  const explainValidRes = await fetch("http://localhost:4000/api/ai/explain-verdict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verdict: "VALID", details: verifyData.details })
  });
  const explainValidData = await explainValidRes.json();
  console.log(` AI Title: ${explainValidData.data.title}`);
  console.log(` AI Recommendation: ${explainValidData.data.recommendation}`);

  // 5. Cryptographic Verification: Tampered File (TAMPERED)
  console.log("\n[5/7] Testing Cryptographic Verification: Tampered PDF (9.72 CGPA)...");
  const tamperedPath = path.join(__dirname, "../demo-assets/Demo_Transcript_Aarav_Sharma_Tampered.pdf");
  const tamperedBuf = fs.readFileSync(tamperedPath);

  const tamperedForm = new FormData();
  tamperedForm.append("document", new Blob([tamperedBuf], { type: "application/pdf" }), "Demo_Transcript_Aarav_Sharma_Tampered.pdf");
  tamperedForm.append("credentialId", credId);

  const tamperedRes = await fetch("http://localhost:4000/api/credentials/verify", {
    method: "POST",
    body: tamperedForm
  });
  const tamperedData = await tamperedRes.json();
  console.log(` Verdict: ${tamperedData.verdict} (${tamperedData.message.slice(0, 45)}...)`);
  console.log(` Hashes Match: ${tamperedData.details?.hashesMatch}`);
  if (tamperedData.verdict !== "TAMPERED") throw new Error("Expected TAMPERED verdict!");

  // 6. AI Document Analysis
  console.log("\n[6/7] Testing AI Document Structural Analysis...");
  const analyzeForm = new FormData();
  analyzeForm.append("document", new Blob([pdfBuf], { type: "application/pdf" }), "Demo_Transcript_Aarav_Sharma.pdf");
  analyzeForm.append("credentialId", credId);

  const analyzeRes = await fetch("http://localhost:4000/api/ai/analyze-document", {
    method: "POST",
    body: analyzeForm
  });
  const analyzeData = await analyzeRes.json();
  console.log(` Detected Student: ${analyzeData.data.detectedStudent}`);
  console.log(` Detected CGPA: ${analyzeData.data.detectedCgpa}`);
  console.log(` Document Consistency: ${analyzeData.data.documentConsistency}`);
  console.log(` AI Confidence: ${analyzeData.data.confidence}`);

  // 7. Conversational Chatbot
  console.log("\n[7/7] Testing CredentialChain AI Chatbot...");
  const chatRes = await fetch("http://localhost:4000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Why is blockchain used instead of a standard SQL database?",
      context: { credentialId: credId, verificationResult: verifyData }
    })
  });
  const chatData = await chatRes.json();
  console.log(` Chat Response Generated [Source: ${chatData.data.source}]`);
  console.log(` Response Preview: ${chatData.data.reply.slice(0, 120)}...`);

  console.log("\n==================================================");
  console.log(" 🎉 ALL 7 END-TO-END VERIFICATION STEPS PASSED!   ");
  console.log("==================================================\n");
}

runE2ETest().catch((err) => {
  console.error("\n❌ E2E Test Failed:", err);
  process.exit(1);
});
