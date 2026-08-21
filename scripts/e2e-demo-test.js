const fs = require("fs");
const path = require("path");
const assert = require("assert");

async function main() {
  console.log("========================================================");
  console.log("     CredentialChain End-to-End Live Workflow Test      ");
  console.log("========================================================");

  const API_URL = "http://localhost:4000/api";
  const pdfPath = path.join(__dirname, "../demo-assets/Keshav_Demo_Transcript.pdf");
  const tamperedPdfPath = path.join(__dirname, "../demo-assets/Keshav_Demo_Transcript_Tampered.pdf");

  assert.ok(fs.existsSync(pdfPath), "Original demo PDF must exist");
  assert.ok(fs.existsSync(tamperedPdfPath), "Tampered demo PDF must exist");

  // Step 1: Health Check
  console.log("\n[Step 1] Checking API & Blockchain Health...");
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  console.log(" Health Status:", health.status);
  console.log(" Blockchain   :", health.blockchain);
  console.log(" Contract     :", health.contract, `(${health.contractAddress})`);
  assert.strictEqual(health.status, "ok");
  assert.strictEqual(health.blockchain, "connected");

  // Step 2: Issue Credential
  console.log("\n[Step 2] Issuing Credential for Keshav Demo...");
  const credId = `CRED-2026-VITDEMO-${Math.floor(1000 + Math.random() * 9000)}`;
  const pdfBlob = new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" });

  const formData = new FormData();
  formData.append("document", pdfBlob, "Keshav_Demo_Transcript.pdf");
  formData.append("studentName", "Keshav Demo");
  formData.append("registerNumber", "VIT2026DEMO");
  formData.append("programme", "B.Tech Electronics and Communication Engineering");
  formData.append("cgpa", "8.90");
  formData.append("graduationYear", "2026");
  formData.append("credentialType", "Academic Transcript");
  formData.append("customCredentialId", credId);

  const issueRes = await fetch(`${API_URL}/credentials/issue`, {
    method: "POST",
    body: formData
  });

  const issueData = await issueRes.json();
  assert.strictEqual(issueRes.status, 201, `Issuance failed: ${JSON.stringify(issueData)}`);
  assert.strictEqual(issueData.success, true);
  console.log(" Credential Issued on-chain!");
  console.log("   Credential ID :", issueData.data.credentialId);
  console.log("   SHA-256 Hash  :", issueData.data.documentHash);
  console.log("   Tx Hash       :", issueData.data.transactionHash);
  console.log("   Block Number  :", issueData.data.blockNumber);

  // Step 3: Verify Authentic Document -> VALID
  console.log("\n[Step 3] Verifying Authentic Document in Verifier Portal...");
  const verifyOriginalForm = new FormData();
  verifyOriginalForm.append("document", pdfBlob, "Keshav_Demo_Transcript.pdf");
  verifyOriginalForm.append("credentialId", credId);

  const verifyOriginalRes = await fetch(`${API_URL}/credentials/verify`, {
    method: "POST",
    body: verifyOriginalForm
  });

  const verifyOriginalData = await verifyOriginalRes.json();
  console.log(" Verification Verdict:", verifyOriginalData.verdict);
  console.log(" Hashes Match        :", verifyOriginalData.details.hashesMatch);
  assert.strictEqual(verifyOriginalData.verdict, "VALID");
  assert.strictEqual(verifyOriginalData.details.hashesMatch, true);
  assert.strictEqual(verifyOriginalData.status, "ACTIVE");
  console.log(" Authentic document correctly verified as VALID!");

  // Step 4: Verify Tampered Document -> TAMPERED
  console.log("\n[Step 4] Verifying Tampered Document (Altered CGPA)...");
  const tamperedBlob = new Blob([fs.readFileSync(tamperedPdfPath)], { type: "application/pdf" });
  const verifyTamperForm = new FormData();
  verifyTamperForm.append("document", tamperedBlob, "Keshav_Demo_Transcript_Tampered.pdf");
  verifyTamperForm.append("credentialId", credId);

  const verifyTamperRes = await fetch(`${API_URL}/credentials/verify`, {
    method: "POST",
    body: verifyTamperForm
  });

  const verifyTamperData = await verifyTamperRes.json();
  console.log(" Tamper Check Verdict:", verifyTamperData.verdict);
  console.log(" Registered Hash     :", verifyTamperData.details.registeredDocumentHash);
  console.log(" Tampered Hash       :", verifyTamperData.details.uploadedDocumentHash);
  console.log(" Hashes Match        :", verifyTamperData.details.hashesMatch);
  assert.strictEqual(verifyTamperData.verdict, "TAMPERED");
  assert.strictEqual(verifyTamperData.details.hashesMatch, false);
  console.log(" Tampered document correctly detected as TAMPERED!");

  // Step 5: Revoke Credential on Blockchain
  console.log("\n[Step 5] Revoking Credential on Blockchain...");
  const revokeRes = await fetch(`${API_URL}/credentials/${encodeURIComponent(credId)}/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "Administrative record update" })
  });

  const revokeData = await revokeRes.json();
  assert.strictEqual(revokeRes.status, 200);
  assert.strictEqual(revokeData.success, true);
  console.log(" Revocation Confirmed on Blockchain!");
  console.log("   Revocation Tx Hash:", revokeData.data.revocationTxHash);

  // Step 6: Verify Original Document After Revocation -> REVOKED
  console.log("\n[Step 6] Verifying Revoked Credential in Verifier Portal...");
  const verifyRevokedForm = new FormData();
  verifyRevokedForm.append("document", pdfBlob, "Keshav_Demo_Transcript.pdf");
  verifyRevokedForm.append("credentialId", credId);

  const verifyRevokedRes = await fetch(`${API_URL}/credentials/verify`, {
    method: "POST",
    body: verifyRevokedForm
  });

  const verifyRevokedData = await verifyRevokedRes.json();
  console.log(" Post-Revocation Verdict:", verifyRevokedData.verdict);
  console.log(" On-Chain Status        :", verifyRevokedData.status);
  assert.strictEqual(verifyRevokedData.verdict, "REVOKED");
  assert.strictEqual(verifyRevokedData.status, "REVOKED");
  console.log(" Revoked credential correctly verified as REVOKED!");

  console.log("\n========================================================");
  console.log("  ALL END-TO-END VERIFICATION WORKFLOWS PASSED 100%!   ");
  console.log("========================================================\n");
}

main().catch((err) => {
  console.error("❌ E2E Test Failed:", err);
  process.exit(1);
});
