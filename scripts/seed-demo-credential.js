const fs = require("fs");
const path = require("path");

async function main() {
  const API_URL = "http://localhost:4000/api";
  const pdfPath = path.join(__dirname, "../demo-assets/Keshav_Demo_Transcript.pdf");
  
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF path not found");
    return;
  }

  const credId = "CRED-2026-VITDEMO-001";
  const pdfBlob = new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" });

  const formData = new FormData();
  formData.append("document", pdfBlob, "Keshav_Demo_Transcript.pdf");
  formData.append("studentName", "Keshav Demo");
  formData.append("registerNumber", "VIT2026DEMO");
  formData.append("programme", "B.Tech Electronics and Communication Engineering");
  formData.append("cgpa", "8.90");
  formData.append("graduationYear", "2026");
  formData.append("credentialType", "Academic Transcript");
  formData.append("recipientWallet", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  formData.append("customCredentialId", credId);
  formData.append("notes", "Official transcript record for Keshav Demo graduation verification.");

  try {
    const res = await fetch(`${API_URL}/credentials/issue`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      console.log(` Demo Credential seeded successfully: ${credId} (Tx: ${data.data.transactionHash})`);
    } else {
      console.log(`ℹ️ Credential seeding info: ${data.error}`);
    }
  } catch (err) {
    console.error("Failed to seed demo credential:", err.message);
  }
}

main();
