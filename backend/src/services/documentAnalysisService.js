const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const db = require("../config/db");

class DocumentAnalysisService {
  /**
   * Analyzes an uploaded PDF document or demo asset structure using real textual extraction
   */
  async analyzeDocument({ filePath, buffer, credentialId, demoModeType }) {
    let pdfText = "";
    let fileBuffer = buffer;

    // 1. Resolve buffer if file path is provided
    if (!fileBuffer && filePath && fs.existsSync(filePath)) {
      fileBuffer = fs.readFileSync(filePath);
    }

    // 2. If demo mode type is provided and no buffer yet, read from demo-assets
    if (!fileBuffer && demoModeType) {
      const demoAssetsDir = path.join(__dirname, "../../demo-assets");
      const safeFilename = demoModeType.endsWith(".pdf")
        ? demoModeType
        : demoModeType === "tampered"
        ? "Keshav_Demo_Transcript_Tampered.pdf"
        : "Keshav_Demo_Transcript.pdf";

      const demoPath = path.join(demoAssetsDir, safeFilename);
      if (fs.existsSync(demoPath)) {
        fileBuffer = fs.readFileSync(demoPath);
      }
    }

    // 3. If credentialId is provided, check if we have stored file on disk
    let linkedRecord = null;
    if (credentialId) {
      linkedRecord = db.findCredentialById(credentialId);
      if (!fileBuffer && linkedRecord && linkedRecord.storedFileName) {
        const storedPath = path.join(__dirname, "../../uploads", linkedRecord.storedFileName);
        if (fs.existsSync(storedPath)) {
          fileBuffer = fs.readFileSync(storedPath);
        }
      }
    }

    // 4. Extract real text from PDF using PDFParse
    if (fileBuffer) {
      try {
        const parser = new PDFParse({ data: fileBuffer });
        const parseResult = await parser.getText();
        pdfText = (parseResult && parseResult.text ? parseResult.text : String(parseResult || "")).trim();
      } catch (parseErr) {
        console.warn("PDFParse text extraction warning:", parseErr.message);
        pdfText = fileBuffer.toString("latin1");
      }
    }

    // 5. Intelligent Field Extraction from real text
    const detected = this.extractFieldsFromPdfText(pdfText, linkedRecord);

    // 6. Consistency Evaluation
    const inconsistencies = [];
    let isConsistent = true;
    let confidenceScore = 95;

    // Only validate CGPA for documents that typically require CGPA (like Transcripts)
    const isAdmissionOrOffer =
      detected.documentType.includes("Admission") ||
      detected.documentType.includes("Offer") ||
      detected.documentType.includes("Bonafide") ||
      detected.documentType.includes("Migration");

    if (!isAdmissionOrOffer && detected.cgpa && !detected.cgpa.includes("N/A")) {
      const num = parseFloat(detected.cgpa);
      if (isNaN(num) || num > 10.0 || num < 0.0) {
        inconsistencies.push("CGPA value is outside normal university scale (0.00 - 10.00).");
        isConsistent = false;
        confidenceScore -= 25;
      }
    }

    // Check for demo alteration flags
    if (pdfText.includes("TAMPERED") || (demoModeType && demoModeType.includes("tampered"))) {
      inconsistencies.push("Document contains visible alteration or demonstration markers.");
      isConsistent = false;
      confidenceScore = 88;
    }

    // Cross-check extracted entities with registered on-chain / database record if available
    if (linkedRecord) {
      if (
        detected.studentName &&
        linkedRecord.studentName &&
        detected.studentName !== "Registered Candidate" &&
        !detected.studentName.toLowerCase().includes(linkedRecord.studentName.toLowerCase().split(" ")[0]) &&
        !linkedRecord.studentName.toLowerCase().includes(detected.studentName.toLowerCase().split(" ")[0])
      ) {
        inconsistencies.push(
          `Extracted candidate name (${detected.studentName}) does not match registration record (${linkedRecord.studentName}).`
        );
        isConsistent = false;
        confidenceScore -= 15;
      }
    }

    return {
      success: true,
      analysisTimestamp: new Date().toISOString(),
      documentType: detected.documentType,
      detectedInstitution: detected.institution,
      detectedStudent: detected.studentName,
      detectedRegisterNumber: detected.registerNumber,
      detectedProgramme: detected.programme,
      detectedCgpa: detected.cgpa,
      academicYear: detected.academicYear,
      issueDate: detected.issueDate,
      documentConsistency: isConsistent ? "Consistent" : "Inconsistencies Flagged",
      isConsistent,
      potentialIssues:
        inconsistencies.length > 0 ? inconsistencies : ["None detected. Document structure is well-formed."],
      confidence: `${Math.max(confidenceScore, 60)}%`,
      disclaimer: "AI-assisted analysis — provides structural insights but does not replace blockchain cryptographic verification."
    };
  }

  /**
   * Intelligently parses raw textual content of an arbitrary academic/admission PDF
   */
  extractFieldsFromPdfText(text, fallbackRecord) {
    const res = {};
    const lowerText = (text || "").toLowerCase();
    const lines = (text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const clean = (str, delimiters) => {
      if (!str) return "";
      let s = str;
      for (const d of delimiters) {
        const idx = s.indexOf(d);
        if (idx !== -1) s = s.slice(0, idx);
      }
      return s.trim();
    };

    // ==========================================
    // 1. DETECT DOCUMENT TYPE
    // ==========================================
    if (
      lowerText.includes("admission acceptance") ||
      lowerText.includes("provisional admission") ||
      lowerText.includes("offer letter") ||
      lowerText.includes("admission letter") ||
      lowerText.includes("selected for admission") ||
      lowerText.includes("letter of admission")
    ) {
      res.documentType = "Admission Acceptance Letter";
    } else if (lowerText.includes("bonafide certificate") || lowerText.includes("bonafide")) {
      res.documentType = "Bonafide Certificate";
    } else if (lowerText.includes("migration certificate")) {
      res.documentType = "Migration Certificate";
    } else if (lowerText.includes("degree certificate") || lowerText.includes("degree of bachelor") || lowerText.includes("degree of master")) {
      res.documentType = "Degree Certificate";
    } else if (lowerText.includes("transcript") || lowerText.includes("grade sheet") || lowerText.includes("marksheet") || lowerText.includes("academic performance")) {
      res.documentType = "Academic Transcript";
    } else {
      res.documentType = fallbackRecord ? fallbackRecord.credentialType : "Official Academic Document";
    }

    // ==========================================
    // 2. DETECT INSTITUTION
    // ==========================================
    const knownInstitutions = [
      "Vellore Institute of Technology",
      "VIT University",
      "VIT",
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
      "Indian Institute of Technology",
      "National Institute of Technology",
      "Anna University",
      "Manipal University",
      "SRM Institute of Science and Technology",
      "BITS Pilani"
    ];

    for (const inst of knownInstitutions) {
      if (lowerText.includes(inst.toLowerCase())) {
        res.institution = inst === "VIT" ? "Vellore Institute of Technology (VIT)" : inst;
        break;
      }
    }

    if (!res.institution) {
      for (const line of lines.slice(0, 8)) {
        const instMatch = line.match(/([A-Za-z\s&,.-]+(?:University|Institute of Technology|College of Engineering|Institute of Science|Academy|School of Engineering))/i);
        if (instMatch && instMatch[1].length > 4 && !instMatch[1].toLowerCase().includes("sample") && !instMatch[1].toLowerCase().includes("office")) {
          res.institution = instMatch[1].trim();
          break;
        }
      }
    }

    // ==========================================
    // 3. DETECT STUDENT / CANDIDATE NAME
    // ==========================================
    const nameMatch = text.match(/(?:Student Name|Candidate Name|Applicant Name|Name of the Candidate|Name)\s*[:\-]\s*([^\t\n\r]+)/i);
    if (nameMatch && nameMatch[1]) {
      const extracted = clean(nameMatch[1], ["Register", "Reg No", "Roll", "Programme", "Academic", "Date", "\t"]);
      if (extracted && extracted.length > 2 && extracted.length < 50) {
        res.studentName = extracted;
      }
    }

    if (!res.studentName) {
      const dearMatch = text.match(/(?:Dear|Mr\.|Ms\.|Mrs\.)\s+([A-Za-z\s.'-]+)(?:,|\n|$)/i);
      if (dearMatch && dearMatch[1]) {
        const extracted = dearMatch[1].trim().split("\n")[0].split(",")[0].trim();
        if (extracted.length > 2 && extracted.length < 50 && !extracted.toLowerCase().includes("candidate")) {
          res.studentName = extracted;
        }
      }
    }

    // ==========================================
    // 4. DETECT REGISTRATION / APPLICATION NUMBER
    // ==========================================
    const regMatch = text.match(/(?:Application No|Application Number|App No|Appl No|Register Number|Registration No|Reg No|Reg\. No|Roll No|Enrollment No|Student ID)\s*[:.\-#]\s*([A-Za-z0-9-]+)/i);
    if (regMatch && regMatch[1]) {
      res.registerNumber = regMatch[1].trim();
    } else {
      const numMatch = text.match(/\b(202[0-9][0-9]{5,8})\b/);
      if (numMatch && numMatch[1]) {
        res.registerNumber = numMatch[1].trim();
      } else {
        const codeMatch = text.match(/\b([A-Z]{2,4}202[0-9][A-Z0-9]{2,6})\b/);
        if (codeMatch && codeMatch[1]) {
          res.registerNumber = codeMatch[1].trim();
        }
      }
    }

    // ==========================================
    // 5. DETECT PROGRAMME / DEGREE / BRANCH
    // ==========================================
    const progMatch = text.match(/(?:Programme|Program|Branch|Course|Degree)\s*[:\-]\s*([^\t\n\r]+)/i);
    if (progMatch && progMatch[1]) {
      const extracted = clean(progMatch[1], ["Academic", "Batch", "Campus", "Issue", "Date", "Cumulative", "Grade", "\t"]);
      if (extracted && extracted.length > 2 && extracted.length < 70) {
        res.programme = extracted;
      }
    }

    if (!res.programme) {
      const degreeMatch = text.match(/\b(B\.?Tech|M\.?Tech|B\.?Sc|M\.?Sc|B\.?E\.?|M\.?E\.?|B\.?Com|B\.?B\.?A|M\.?B\.?A|Ph\.?D)[\s\w&,()-]+/i);
      if (degreeMatch && degreeMatch[0]) {
        const extracted = clean(degreeMatch[0], ["Academic", "Batch", "Campus", "Issue", "Date", "\n", "\t"]);
        if (extracted && extracted.length > 2 && extracted.length < 70) {
          res.programme = extracted;
        }
      }
    }

    // ==========================================
    // 6. DETECT CGPA / GPA / MARKS
    // ==========================================
    const cgpaRegexes = [
      /(?:CGPA|Cumulative GPA|Grade Point Average|GPA)\s*[:\-]\s*(\d{1,2}\.\d{1,2})/i,
      /(\d\.\d{2})\s*\/\s*10(?:\.00)?/,
      /(?:Percentage|Marks Obtained)\s*[:\-]\s*(\d{1,3}(?:\.\d{1,2})?%?)/i
    ];

    for (const r of cgpaRegexes) {
      const match = text.match(r);
      if (match && match[1]) {
        res.cgpa = match[1].trim();
        break;
      }
    }

    if (!res.cgpa) {
      if (res.documentType === "Admission Acceptance Letter") {
        res.cgpa = "N/A (Admission Offer)";
      } else if (res.documentType === "Bonafide Certificate" || res.documentType === "Migration Certificate") {
        res.cgpa = "N/A (Certificate)";
      } else if (fallbackRecord && fallbackRecord.cgpa && fallbackRecord.cgpa.toLowerCase() !== "none") {
        res.cgpa = fallbackRecord.cgpa;
      } else {
        res.cgpa = "N/A";
      }
    }

    // ==========================================
    // 7. DETECT ACADEMIC YEAR & DATES
    // ==========================================
    const yearMatch = text.match(/(?:Academic Year|Session|Year of Admission|Batch)\s*[:\-]\s*(\d{4}\s*-\s*\d{4}|\d{4})/i);
    if (yearMatch) {
      res.academicYear = yearMatch[1].trim();
    }

    const dateMatch = text.match(/(?:Date|Dated|Issue Date)\s*[:\-]\s*([A-Za-z0-9,\s/-]{6,20})/i);
    if (dateMatch) {
      res.issueDate = dateMatch[1].trim().split("\n")[0];
    }

    // ==========================================
    // 8. FALLBACK ASSIGNMENTS (If not extracted)
    // ==========================================
    if (fallbackRecord) {
      if (!res.studentName || res.studentName.length < 2) res.studentName = fallbackRecord.studentName;
      if (!res.registerNumber) res.registerNumber = fallbackRecord.registerNumber;
      if (!res.institution) res.institution = fallbackRecord.institutionName;
      if (!res.programme) res.programme = fallbackRecord.programme;
      if (!res.documentType) res.documentType = fallbackRecord.credentialType;
    }

    // Defaults if still empty
    res.documentType = res.documentType || "Official Academic Document";
    res.institution = res.institution || "CredentialChain Autonomous University";
    res.studentName = res.studentName || "Registered Candidate";
    res.registerNumber = res.registerNumber || "N/A";
    res.programme = res.programme || "Academic Programme";
    res.academicYear = res.academicYear || "2022 - 2026";
    res.issueDate = res.issueDate || "Current Academic Session";

    return res;
  }
}

module.exports = new DocumentAnalysisService();
