const documentAnalysisService = require("../backend/src/services/documentAnalysisService");
const path = require("path");
const fs = require("fs");

async function testAnalysis() {
  console.log("==================================================");
  console.log("      Testing Enhanced Document Analysis Engine   ");
  console.log("==================================================");

  // Test 1: Real PDF Demo Transcript
  const demoPath = path.join(__dirname, "../demo-assets/Demo_Transcript_Aarav_Sharma.pdf");
  const res1 = await documentAnalysisService.analyzeDocument({ filePath: demoPath });
  console.log("\n[Test 1] Real Demo Transcript Analysis Result:");
  console.log({
    documentType: res1.documentType,
    institution: res1.detectedInstitution,
    student: res1.detectedStudent,
    regNo: res1.detectedRegisterNumber,
    programme: res1.detectedProgramme,
    cgpa: res1.detectedCgpa,
    consistency: res1.documentConsistency,
    confidence: res1.confidence
  });

  // Test 2: Admission Acceptance Letter buffer (Simulating user's upload)
  const admissionText = `
VELLORE INSTITUTE OF TECHNOLOGY (VIT)
OFFICE OF ADMISSIONS - VELLORE CAMPUS
PROVISIONAL ADMISSION ACCEPTANCE LETTER

Date: July 10, 2025
Application No: 2025254556

Dear Keshav,

We are pleased to inform you that you have been provisionally admitted to the following programme:
Programme: B.Tech Computer Science and Engineering (Specialization in AI and ML)
Batch: 2025 - 2029
Campus: VIT Vellore Campus

Please present this letter for verification during physical document reporting.

Director of Admissions
Vellore Institute of Technology
`;

  const res2 = await documentAnalysisService.analyzeDocument({ buffer: Buffer.from(admissionText) });
  console.log("\n[Test 2] Admission Acceptance Letter Analysis Result:");
  console.log({
    documentType: res2.documentType,
    institution: res2.detectedInstitution,
    student: res2.detectedStudent,
    regNo: res2.detectedRegisterNumber,
    programme: res2.detectedProgramme,
    cgpa: res2.detectedCgpa,
    consistency: res2.documentConsistency,
    issues: res2.potentialIssues,
    confidence: res2.confidence
  });
}

testAnalysis().catch(console.error);
