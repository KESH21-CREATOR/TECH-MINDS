const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function generateTranscript(isTampered = false) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Background Header Banner
  page.drawRectangle({
    x: 30,
    y: height - 120,
    width: width - 60,
    height: 90,
    color: rgb(0.06, 0.09, 0.16) // #0f172a navy slate
  });

  // Institution Title
  page.drawText("CREDENTIALCHAIN DEMO UNIVERSITY", {
    x: 50,
    y: height - 60,
    size: 18,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1)
  });

  page.drawText("OFFICE OF THE REGISTRAR & CONTROLLER OF EXAMINATIONS", {
    x: 50,
    y: height - 78,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.8, 0.85, 0.95)
  });

  page.drawText("Accredited Institution - Blockchain Verified Academic Record System", {
    x: 50,
    y: height - 95,
    size: 8,
    font: fontHelveticaOblique,
    color: rgb(0.6, 0.7, 0.85)
  });

  // Watermark / Demo Disclaimer
  page.drawRectangle({
    x: 30,
    y: height - 145,
    width: width - 60,
    height: 20,
    color: isTampered ? rgb(0.95, 0.85, 0.85) : rgb(0.9, 0.94, 0.99)
  });

  page.drawText(
    isTampered
      ? "*** TAMPERED DEMO RECORD: CGPA ALTERED TO 9.90 - NOT OFFICIAL ***"
      : "*** HACKATHON DEMO RECORD: SAMPLE / NOT AN OFFICIAL ACADEMIC RECORD ***",
    {
      x: 60,
      y: height - 138,
      size: 8.5,
      font: fontHelveticaBold,
      color: isTampered ? rgb(0.7, 0.1, 0.1) : rgb(0.1, 0.3, 0.6)
    }
  );

  // Student Profile Card Box
  page.drawRectangle({
    x: 30,
    y: height - 260,
    width: width - 60,
    height: 105,
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1.0)
  });

  page.drawText("CANDIDATE INFORMATION", {
    x: 45,
    y: height - 170,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  const studentDetails = [
    { label: "Student Name:", value: "Keshav Demo" },
    { label: "Registration No:", value: "VIT2026DEMO" },
    { label: "Programme:", value: "B.Tech Electronics and Communication Engineering" },
    { label: "Graduation Year:", value: "2026" },
    { label: "Issuance Date:", value: "August 21, 2026" },
    { label: "Credential Type:", value: "Official Academic Transcript" }
  ];

  let leftY = height - 190;
  for (let i = 0; i < 3; i++) {
    const item = studentDetails[i];
    page.drawText(item.label, { x: 45, y: leftY, size: 8.5, font: fontHelveticaBold, color: rgb(0.3, 0.35, 0.4) });
    page.drawText(item.value, { x: 145, y: leftY, size: 8.5, font: fontHelvetica, color: rgb(0.05, 0.1, 0.2) });
    leftY -= 18;
  }

  let rightY = height - 190;
  for (let i = 3; i < 6; i++) {
    const item = studentDetails[i];
    page.drawText(item.label, { x: 320, y: rightY, size: 8.5, font: fontHelveticaBold, color: rgb(0.3, 0.35, 0.4) });
    page.drawText(item.value, { x: 420, y: rightY, size: 8.5, font: fontHelvetica, color: rgb(0.05, 0.1, 0.2) });
    rightY -= 18;
  }

  // Academic Course Grades Table
  const tableTop = height - 280;
  page.drawText("ACADEMIC PERFORMANCE SUMMARY", {
    x: 45,
    y: tableTop,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  // Table Header
  const headerY = tableTop - 20;
  page.drawRectangle({
    x: 30,
    y: headerY - 5,
    width: width - 60,
    height: 20,
    color: rgb(0.15, 0.23, 0.36)
  });

  page.drawText("Course Code", { x: 45, y: headerY, size: 8.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Course Title", { x: 130, y: headerY, size: 8.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Credits", { x: 380, y: headerY, size: 8.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Grade", { x: 450, y: headerY, size: 8.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Points", { x: 510, y: headerY, size: 8.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });

  const courses = isTampered
    ? [
        { code: "ECE3001", title: "Digital Signal Processing", credits: "4.0", grade: "S", points: "10.0" },
        { code: "ECE3002", title: "Microcontrollers & Embedded Systems", credits: "4.0", grade: "S", points: "10.0" },
        { code: "ECE3003", title: "VLSI Design Methodologies", credits: "3.0", grade: "S", points: "10.0" },
        { code: "CSE2005", title: "Computer Communication Networks", credits: "3.0", grade: "S", points: "10.0" },
        { code: "CSE4012", title: "Cryptography & Blockchain Security", credits: "3.0", grade: "S", points: "10.0" },
        { code: "ECE4098", title: "Capstone Design Project", credits: "6.0", grade: "S", points: "10.0" }
      ]
    : [
        { code: "ECE3001", title: "Digital Signal Processing", credits: "4.0", grade: "A", points: "9.0" },
        { code: "ECE3002", title: "Microcontrollers & Embedded Systems", credits: "4.0", grade: "S", points: "10.0" },
        { code: "ECE3003", title: "VLSI Design Methodologies", credits: "3.0", grade: "A", points: "9.0" },
        { code: "CSE2005", title: "Computer Communication Networks", credits: "3.0", grade: "A", points: "9.0" },
        { code: "CSE4012", title: "Cryptography & Blockchain Security", credits: "3.0", grade: "S", points: "10.0" },
        { code: "ECE4098", title: "Capstone Design Project", credits: "6.0", grade: "A", points: "9.0" }
      ];

  let rowY = headerY - 24;
  courses.forEach((c, idx) => {
    const isEven = idx % 2 === 0;
    page.drawRectangle({
      x: 30,
      y: rowY - 5,
      width: width - 60,
      height: 20,
      color: isEven ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1)
    });

    page.drawText(c.code, { x: 45, y: rowY, size: 8, font: fontHelvetica, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(c.title, { x: 130, y: rowY, size: 8, font: fontHelvetica, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(c.credits, { x: 390, y: rowY, size: 8, font: fontHelvetica, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(c.grade, {
      x: 460,
      y: rowY,
      size: 8,
      font: fontHelveticaBold,
      color: isTampered ? rgb(0.8, 0.1, 0.1) : rgb(0.1, 0.3, 0.6)
    });
    page.drawText(c.points, { x: 520, y: rowY, size: 8, font: fontHelvetica, color: rgb(0.2, 0.2, 0.2) });

    rowY -= 22;
  });

  // Cumulative Result Box
  const cgpaValue = isTampered ? "9.90 / 10.00" : "8.90 / 10.00";
  const divisionValue = isTampered ? "First Class with Exemplary Distinction (MODIFIED)" : "First Class with Distinction";

  page.drawRectangle({
    x: 30,
    y: rowY - 50,
    width: width - 60,
    height: 45,
    color: isTampered ? rgb(0.99, 0.92, 0.92) : rgb(0.94, 0.97, 1.0),
    borderColor: isTampered ? rgb(0.9, 0.4, 0.4) : rgb(0.3, 0.5, 0.8),
    borderWidth: 1.5
  });

  page.drawText("CUMULATIVE GRADE POINT AVERAGE (CGPA):", {
    x: 45,
    y: rowY - 26,
    size: 10,
    font: fontHelveticaBold,
    color: isTampered ? rgb(0.7, 0.1, 0.1) : rgb(0.1, 0.2, 0.4)
  });

  page.drawText(cgpaValue, {
    x: 340,
    y: rowY - 26,
    size: 12,
    font: fontHelveticaBold,
    color: isTampered ? rgb(0.8, 0.1, 0.1) : rgb(0.08, 0.45, 0.2)
  });

  page.drawText("Classification: " + divisionValue, {
    x: 45,
    y: rowY - 42,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.3, 0.35, 0.4)
  });

  // Verification & Blockchain Note
  const footerTop = 150;
  page.drawRectangle({
    x: 30,
    y: footerTop - 45,
    width: width - 60,
    height: 40,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1
  });

  page.drawText("CRYPTOGRAPHIC INTEGRITY & VERIFICATION NOTE:", {
    x: 45,
    y: footerTop - 18,
    size: 7.5,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.25, 0.3)
  });

  page.drawText(
    "This document's binary contents are cryptographically hashed via SHA-256 and anchored to the Ethereum EVM",
    { x: 45, y: footerTop - 29, size: 7, font: fontHelvetica, color: rgb(0.35, 0.4, 0.45) }
  );
  page.drawText(
    "AcademicCredentialRegistry smart contract. Any byte-level modification invalidates authenticity instantly.",
    { x: 45, y: footerTop - 38, size: 7, font: fontHelvetica, color: rgb(0.35, 0.4, 0.45) }
  );

  // Signatures Section
  page.drawLine({
    start: { x: 50, y: 70 },
    end: { x: 190, y: 70 },
    thickness: 1,
    color: rgb(0.5, 0.55, 0.6)
  });
  page.drawText("Controller of Examinations", {
    x: 55,
    y: 55,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.25, 0.3)
  });

  page.drawLine({
    start: { x: 400, y: 70 },
    end: { x: 540, y: 70 },
    thickness: 1,
    color: rgb(0.5, 0.55, 0.6)
  });
  page.drawText("Registrar / Dean of Academics", {
    x: 405,
    y: 55,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.25, 0.3)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function main() {
  console.log("Generating Demo Academic Transcript PDFs...");

  const demoAssetsDir = path.join(__dirname, "../demo-assets");
  const backendUploadsDir = path.join(__dirname, "../backend/uploads");
  const frontendPublicDir = path.join(__dirname, "../frontend/public/demo-assets");

  [demoAssetsDir, backendUploadsDir, frontendPublicDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 1. Generate Authentic PDF
  const originalBytes = await generateTranscript(false);
  const originalPath = path.join(demoAssetsDir, "Keshav_Demo_Transcript.pdf");
  fs.writeFileSync(originalPath, originalBytes);
  fs.writeFileSync(path.join(backendUploadsDir, "Keshav_Demo_Transcript.pdf"), originalBytes);
  fs.writeFileSync(path.join(frontendPublicDir, "Keshav_Demo_Transcript.pdf"), originalBytes);

  const originalHash = crypto.createHash("sha256").update(originalBytes).digest("hex");

  // 2. Generate Tampered PDF (Modified CGPA & grades)
  const tamperedBytes = await generateTranscript(true);
  const tamperedPath = path.join(demoAssetsDir, "Keshav_Demo_Transcript_Tampered.pdf");
  fs.writeFileSync(tamperedPath, tamperedBytes);
  fs.writeFileSync(path.join(backendUploadsDir, "Keshav_Demo_Transcript_Tampered.pdf"), tamperedBytes);
  fs.writeFileSync(path.join(frontendPublicDir, "Keshav_Demo_Transcript_Tampered.pdf"), tamperedBytes);

  const tamperedHash = crypto.createHash("sha256").update(tamperedBytes).digest("hex");

  console.log("\n=======================================================");
  console.log("  Demo Assets Generated Successfully!");
  console.log("=======================================================");
  console.log(" Original File : Keshav_Demo_Transcript.pdf");
  console.log(" Size          :", originalBytes.length, "bytes");
  console.log(" SHA-256 Hash  :", originalHash);
  console.log("-------------------------------------------------------");
  console.log(" Tampered File : Keshav_Demo_Transcript_Tampered.pdf");
  console.log(" Size          :", tamperedBytes.length, "bytes");
  console.log(" SHA-256 Hash  :", tamperedHash);
  console.log("-------------------------------------------------------");
  console.log(" Hashes Match? :", originalHash === tamperedHash ? "YES" : "NO (Tamper Detectable)");
  console.log("=======================================================\n");

  // Save hashes reference json
  const hashesInfo = {
    original: {
      filename: "Keshav_Demo_Transcript.pdf",
      sha256: originalHash,
      student: "Keshav Demo",
      regNo: "VIT2026DEMO",
      cgpa: "8.90"
    },
    tampered: {
      filename: "Keshav_Demo_Transcript_Tampered.pdf",
      sha256: tamperedHash,
      student: "Keshav Demo",
      regNo: "VIT2026DEMO",
      cgpa: "9.90 (Altered)"
    }
  };

  fs.writeFileSync(path.join(demoAssetsDir, "demo-hashes.json"), JSON.stringify(hashesInfo, null, 2));
  fs.writeFileSync(path.join(frontendPublicDir, "demo-hashes.json"), JSON.stringify(hashesInfo, null, 2));
}

main().catch(console.error);
