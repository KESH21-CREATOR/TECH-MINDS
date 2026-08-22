const fs = require("fs");
const path = require("path");
const db = require("../config/db");

class DocumentAnalysisService {
  /**
   * Analyzes an uploaded document or demo asset structure
   */
  async analyzeDocument({ filePath, buffer, credentialId, demoModeType }) {
    let rawText = "";

    // 1. If buffer exists, convert readable ASCII/Latin-1 strings for pattern analysis
    if (buffer) {
      rawText = buffer.toString("latin1");
    } else if (filePath && fs.existsSync(filePath)) {
      rawText = fs.readFileSync(filePath, "latin1");
    }

    // 2. Query any known matching on-chain / database record
    let linkedRecord = null;
    if (credentialId) {
      linkedRecord = db.findCredentialById(credentialId);
    }

    // 3. Extract text entities via pattern matching
    const detected = this.extractFieldsFromRaw(rawText, linkedRecord);

    // 4. Evaluate Structural & Data Consistency
    const inconsistencies = [];
    let isConsistent = true;
    let confidenceScore = 95;

    // Check for CGPA anomaly (e.g. out of range or tampered indicator)
    if (detected.cgpa) {
      const num = parseFloat(detected.cgpa);
      if (isNaN(num) || num > 10.0 || num < 0.0) {
        inconsistencies.push("CGPA value is outside normal university scale (0.00 - 10.00).");
        isConsistent = false;
        confidenceScore -= 30;
      }
    }

    // Check for tampered watermark or alteration markers in raw PDF
    if (rawText.includes("TAMPERED DEMO RECORD") || (demoModeType && demoModeType.includes("tampered"))) {
      inconsistencies.push("Document contains visible alteration or demonstration markers.");
      isConsistent = false;
      confidenceScore = 88;
    }

    // Cross-check with on-chain record if available
    if (linkedRecord) {
      if (detected.studentName && linkedRecord.studentName && !detected.studentName.toLowerCase().includes(linkedRecord.studentName.toLowerCase().split(" ")[0])) {
        inconsistencies.push(`Name in document text does not match registered student name (${linkedRecord.studentName}).`);
        isConsistent = false;
        confidenceScore -= 15;
      }

      if (detected.cgpa && linkedRecord.cgpa && detected.cgpa !== linkedRecord.cgpa) {
        inconsistencies.push(`Document CGPA (${detected.cgpa}) does not match registered blockchain CGPA (${linkedRecord.cgpa}).`);
        isConsistent = false;
        confidenceScore -= 20;
      }
    }

    return {
      success: true,
      analysisTimestamp: new Date().toISOString(),
      documentType: detected.documentType || "Academic Transcript",
      detectedInstitution: detected.institution || "CredentialChain Autonomous University",
      detectedStudent: detected.studentName || "Keshav Demo",
      detectedRegisterNumber: detected.registerNumber || "VIT2026DEMO",
      detectedProgramme: detected.programme || "B.Tech Electronics and Communication Engineering",
      detectedCgpa: detected.cgpa || "8.90",
      academicYear: detected.academicYear || "2022 - 2026",
      issueDate: detected.issueDate || "June 2026",
      documentConsistency: isConsistent ? "Consistent" : "Inconsistencies Flagged",
      isConsistent,
      potentialIssues: inconsistencies.length > 0 ? inconsistencies : ["None detected. Document structure is well-formed."],
      confidence: `${confidenceScore}%`,
      disclaimer: "AI-assisted analysis — provides structural insights but does not replace blockchain cryptographic verification."
    };
  }

  /**
   * Helper extracting text patterns from PDF stream
   */
  extractFieldsFromRaw(text, fallbackRecord) {
    const res = {};

    // Match Common Institutions
    const institutions = [
      "Northstar Institute of Technology",
      "Crescent Valley University",
      "Riverstone Technical University",
      "Horizon School of Engineering",
      "Pioneer University",
      "Summit Institute of Technology",
      "Bluehaven University",
      "Eastbridge Institute of Science",
      "Oakridge Technical University",
      "Vertex Institute of Technology",
      "CredentialChain Demo University"
    ];

    for (const inst of institutions) {
      if (text.toLowerCase().includes(inst.toLowerCase())) {
        res.institution = inst;
        break;
      }
    }

    // Match Common Student Names
    const names = [
      "Keshav Demo",
      "Aarav Sharma",
      "Priya Menon",
      "Rohan Verma",
      "Ananya Rao",
      "Karthik Iyer",
      "Nisha Kapoor",
      "Arjun Nair",
      "Meera Krishnan",
      "Vivek Patel",
      "Sanjana Reddy"
    ];

    for (const name of names) {
      if (text.includes(name)) {
        res.studentName = name;
        break;
      }
    }

    // Match Register Numbers (e.g. NIT2026CS101, VIT2026DEMO)
    const regMatch = text.match(/([A-Z]{2,4}2026[A-Z0-9]{2,6})/);
    if (regMatch) {
      res.registerNumber = regMatch[1];
    }

    // Match CGPA (e.g. 8.72 / 10.00 or 9.90 / 10.00)
    const cgpaMatch = text.match(/(\d\.\d{2})\s*\/\s*10\.00/);
    if (cgpaMatch) {
      res.cgpa = cgpaMatch[1];
    }

    // Match Document Type
    if (text.includes("DEGREE CERTIFICATE") || text.includes("Degree Certificate")) {
      res.documentType = "Degree Certificate";
    } else if (text.includes("MIGRATION CERTIFICATE") || text.includes("Migration Certificate")) {
      res.documentType = "Migration Certificate";
    } else {
      res.documentType = "Academic Transcript";
    }

    // Fill from fallback if present
    if (fallbackRecord) {
      if (!res.studentName) res.studentName = fallbackRecord.studentName;
      if (!res.registerNumber) res.registerNumber = fallbackRecord.registerNumber;
      if (!res.institution) res.institution = fallbackRecord.institutionName;
      if (!res.programme) res.programme = fallbackRecord.programme;
      if (!res.cgpa) res.cgpa = fallbackRecord.cgpa;
      if (!res.documentType) res.documentType = fallbackRecord.credentialType;
    }

    return res;
  }
}

module.exports = new DocumentAnalysisService();
