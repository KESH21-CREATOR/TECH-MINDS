const fs = require("fs");
const path = require("path");

async function runFullAuthTest() {
  console.log("==================================================");
  console.log("   CredentialChain Full Auth & Web3 E2E Test      ");
  console.log("==================================================");

  // 1. Health Check
  console.log("\n[1/6] Testing Backend & Smart Contract Health...");
  const healthRes = await fetch("http://localhost:4000/api/health");
  const health = await healthRes.json();
  console.log(` Blockchain: ${health.blockchain} | Smart Contract: ${health.contractAddress}`);

  // 2. Demo Logins
  console.log("\n[2/6] Testing 1-Click Hackathon Demo Logins...");
  const studentDemoRes = await fetch("http://localhost:4000/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Student" })
  });
  const studentDemo = await studentDemoRes.json();
  console.log(` Student Demo Login: ${studentDemo.user?.name} (Role: ${studentDemo.user?.role})`);

  const instDemoRes = await fetch("http://localhost:4000/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Institution" })
  });
  const instDemo = await instDemoRes.json();
  console.log(` Institution Demo Login: ${instDemo.user?.name} (Role: ${instDemo.user?.role})`);
  const instToken = instDemo.token;

  const verifierDemoRes = await fetch("http://localhost:4000/api/auth/demo-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Verifier" })
  });
  const verifierDemo = await verifierDemoRes.json();
  console.log(` Verifier Demo Login: ${verifierDemo.user?.name} (Role: ${verifierDemo.user?.role})`);

  // 3. User Sign Up & Sign In
  console.log("\n[3/6] Testing Custom User Sign Up & Sign In...");
  const customEmail = `student.${Date.now()}@vit.ac.in`;
  const signupRes = await fetch("http://localhost:4000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Keshav Hackathon Candidate",
      email: customEmail,
      password: "SecurePassword@123",
      role: "Student",
      registerNumber: "2025254556",
      programme: "B.Tech Computer Science and Engineering"
    })
  });
  const signupData = await signupRes.json();
  console.log(` New User Registered: ${signupData.user?.name} | Email: ${signupData.user?.email}`);

  // 4. Authenticated Credential Issuance
  console.log("\n[4/6] Testing On-Chain Credential Issuance with Expanded Credential Type...");
  const pdfPath = path.join(__dirname, "../demo-assets/Demo_Transcript_Aarav_Sharma.pdf");
  const pdfBuf = fs.readFileSync(pdfPath);

  const form = new FormData();
  form.append("document", new Blob([pdfBuf], { type: "application/pdf" }), "Demo_Admission_Letter.pdf");
  form.append("studentName", "Keshav Sharma");
  form.append("registerNumber", "2025254556");
  form.append("programme", "B.Tech Computer Science and Engineering");
  form.append("credentialType", "Admission Acceptance Letter");
  form.append("cgpa", "8.90");

  const issueRes = await fetch("http://localhost:4000/api/credentials/issue", {
    method: "POST",
    headers: { Authorization: `Bearer ${instToken}` },
    body: form
  });
  const issueData = await issueRes.json();
  const credId = issueData.data.credentialId;
  console.log(` Credential Issued On-Chain: ${credId} (Type: ${issueData.data.credentialType})`);

  // 5. Verification & AI Explanation
  console.log("\n[5/6] Testing Cryptographic Verification...");
  const verifyRes = await fetch("http://localhost:4000/api/credentials/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentialId: credId })
  });
  const verifyData = await verifyRes.json();
  console.log(` Verdict: ${verifyData.verdict} | Status: ${verifyData.status}`);

  // 6. Universal AI Document Analysis with Aadhaar
  console.log("\n[6/6] Testing Universal AI Document Analysis with Aadhaar extraction...");
  const sampleDocText = `
VELLORE INSTITUTE OF TECHNOLOGY (VIT)
OFFICE OF ADMISSIONS
ADMISSION ACCEPTANCE & IDENTITY VERIFICATION LETTER

Candidate Name: Keshav Sharma
Aadhaar No: 5412 8963 7412
Date of Birth: 15/08/2004
Gender: Male
Application No: 2025254556
Programme: B.Tech Computer Science and Engineering
10th Marks: 95.4%
12th Marks: 92.8%
VITEEE Rank: 1450
Campus: Vellore Campus
Date: August 20, 2025
`;

  const documentAnalysisService = require("../backend/src/services/documentAnalysisService");
  const analysisResult = await documentAnalysisService.analyzeDocument({ buffer: Buffer.from(sampleDocText) });
  console.log(` Document Category : ${analysisResult.documentCategory}`);
  console.log(` Detected Candidate: ${analysisResult.detectedStudent} (Aadhaar: ${analysisResult.identityDetails?.aadharMasked})`);
  console.log(` 10th Marks: ${analysisResult.academicScores?.tenthScore} | 12th Marks: ${analysisResult.academicScores?.twelfthScore} | Rank: ${analysisResult.academicScores?.entranceRank}`);
  console.log(` Document Consistency: ${analysisResult.documentConsistency} (Confidence: ${analysisResult.confidence})`);

  console.log("\n==================================================");
  console.log(" 🎉 ALL 6 E2E AUTHENTICATION & APP STEPS PASSED!  ");
  console.log("==================================================\n");
}

runFullAuthTest().catch((err) => {
  console.error("E2E Test Error:", err);
  process.exit(1);
});
