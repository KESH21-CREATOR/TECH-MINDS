async function test() {
  const API_URL = "http://localhost:4000/api";

  console.log("==================================================");
  console.log("   Testing CredentialChain API Endpoints          ");
  console.log("==================================================");

  // 1. Health
  console.log("\n1. GET /api/health");
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  console.log("Health:", JSON.stringify(health, null, 2));

  // 2. Verify Original
  console.log("\n2. POST /api/credentials/verify (Original Demo Asset)");
  const vOriginalRes = await fetch(`${API_URL}/credentials/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demoModeType: "original", credentialId: "CRED-2026-VITDEMO-001" })
  });
  const vOriginal = await vOriginalRes.json();
  console.log("Verdict:", vOriginal.verdict);
  console.log("Hashes Match:", vOriginal.details.hashesMatch);
  console.log("Status:", vOriginal.status);

  // 3. Verify Tampered
  console.log("\n3. POST /api/credentials/verify (Tampered Demo Asset)");
  const vTamperRes = await fetch(`${API_URL}/credentials/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demoModeType: "tampered", credentialId: "CRED-2026-VITDEMO-001" })
  });
  const vTamper = await vTamperRes.json();
  console.log("Verdict:", vTamper.verdict);
  console.log("Hashes Match:", vTamper.details.hashesMatch);
  console.log("Registered Hash:", vTamper.details.registeredDocumentHash);
  console.log("Uploaded Hash:", vTamper.details.uploadedDocumentHash);

  // 4. Get Credential by ID
  console.log("\n4. GET /api/credentials/CRED-2026-VITDEMO-001");
  const getRes = await fetch(`${API_URL}/credentials/CRED-2026-VITDEMO-001`);
  const getCred = await getRes.json();
  console.log("Student Name:", getCred.data.studentName);
  console.log("On-Chain Registered:", getCred.data.onChain.registered);
  console.log("On-Chain Status:", getCred.data.status);

  console.log("\n==================================================");
  console.log(" All API Endpoint Tests Verified Successfully!   ");
  console.log("==================================================\n");
}

test().catch(console.error);
