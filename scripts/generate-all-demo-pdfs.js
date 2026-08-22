const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEMO_ITEMS = [
  {
    id: "DEMO-01",
    filename: "Demo_Transcript_Aarav_Sharma.pdf",
    tamperedFilename: "Demo_Transcript_Aarav_Sharma_Tampered.pdf",
    studentName: "Aarav Sharma",
    registerNumber: "NIT2026CS101",
    institution: "Northstar Institute of Technology",
    programme: "B.Tech Computer Science and Engineering",
    credentialType: "Academic Transcript",
    cgpa: "8.72",
    tamperedCgpa: "9.72",
    academicYear: "2022 - 2026",
    issueDate: "June 15, 2026",
    courses: [
      { code: "CS101", name: "Data Structures & Algorithms", credits: 4, grade: "A+" },
      { code: "CS201", name: "Operating Systems", credits: 4, grade: "A" },
      { code: "CS301", name: "Database Management Systems", credits: 3, grade: "A+" },
      { code: "CS401", name: "Distributed Systems & Cloud", credits: 4, grade: "A" }
    ]
  },
  {
    id: "DEMO-02",
    filename: "Demo_Transcript_Priya_Menon.pdf",
    tamperedFilename: "Demo_Transcript_Priya_Menon_Tampered.pdf",
    studentName: "Priya Menon",
    registerNumber: "CVU2026EC204",
    institution: "Crescent Valley University",
    programme: "B.Tech Electronics and Communication Engineering",
    credentialType: "Academic Transcript",
    cgpa: "9.12",
    tamperedCgpa: "9.99",
    academicYear: "2022 - 2026",
    issueDate: "June 18, 2026",
    courses: [
      { code: "EC101", name: "Digital Signal Processing", credits: 4, grade: "O" },
      { code: "EC202", name: "Embedded Systems Design", credits: 4, grade: "A+" },
      { code: "EC303", name: "VLSI Circuit Design", credits: 3, grade: "A+" },
      { code: "EC404", name: "Wireless Communications", credits: 4, grade: "O" }
    ]
  },
  {
    id: "DEMO-03",
    filename: "Demo_Degree_Rohan_Verma.pdf",
    studentName: "Rohan Verma",
    registerNumber: "RTU2026ME305",
    institution: "Riverstone Technical University",
    programme: "B.Tech Mechanical Engineering",
    credentialType: "Degree Certificate",
    cgpa: "8.41",
    academicYear: "2022 - 2026",
    issueDate: "July 02, 2026",
    courses: [
      { code: "ME101", name: "Thermodynamics & Heat Transfer", credits: 4, grade: "A" },
      { code: "ME202", name: "Fluid Mechanics", credits: 4, grade: "A" },
      { code: "ME303", name: "Automotive Dynamics", credits: 3, grade: "A+" },
      { code: "ME404", name: "Robotics & Automation", credits: 4, grade: "A" }
    ]
  },
  {
    id: "DEMO-04",
    filename: "Demo_Transcript_Ananya_Rao.pdf",
    tamperedFilename: "Demo_Transcript_Ananya_Rao_Tampered.pdf",
    studentName: "Ananya Rao",
    registerNumber: "HSE2026AI409",
    institution: "Horizon School of Engineering",
    programme: "B.Tech Artificial Intelligence and Data Science",
    credentialType: "Academic Transcript",
    cgpa: "9.34",
    tamperedCgpa: "9.95",
    academicYear: "2022 - 2026",
    issueDate: "June 20, 2026",
    courses: [
      { code: "AI101", name: "Deep Neural Networks", credits: 4, grade: "O" },
      { code: "AI202", name: "Natural Language Processing", credits: 4, grade: "O" },
      { code: "AI303", name: "Computer Vision & Edge AI", credits: 4, grade: "A+" },
      { code: "AI404", name: "Reinforcement Learning", credits: 3, grade: "O" }
    ]
  },
  {
    id: "DEMO-05",
    filename: "Demo_Migration_Karthik_Iyer.pdf",
    studentName: "Karthik Iyer",
    registerNumber: "PU2026CS512",
    institution: "Pioneer University",
    programme: "B.Sc Computer Science",
    credentialType: "Migration Certificate",
    cgpa: "8.67",
    academicYear: "2023 - 2026",
    issueDate: "May 28, 2026",
    courses: [
      { code: "CS101", name: "Core Java & OOP", credits: 4, grade: "A+" },
      { code: "CS102", name: "Web Technologies", credits: 3, grade: "A" },
      { code: "CS103", name: "Computer Architecture", credits: 3, grade: "A+" },
      { code: "CS104", name: "Software Engineering", credits: 3, grade: "A" }
    ]
  },
  {
    id: "DEMO-06",
    filename: "Demo_Transcript_Nisha_Kapoor.pdf",
    studentName: "Nisha Kapoor",
    registerNumber: "SIT2026IT618",
    institution: "Summit Institute of Technology",
    programme: "B.Tech Information Technology",
    credentialType: "Academic Transcript",
    cgpa: "8.95",
    academicYear: "2022 - 2026",
    issueDate: "June 25, 2026",
    courses: [
      { code: "IT101", name: "Cybersecurity & Cryptography", credits: 4, grade: "A+" },
      { code: "IT202", name: "Full Stack Web Development", credits: 4, grade: "O" },
      { code: "IT303", name: "DevOps & CI/CD Pipelines", credits: 3, grade: "A+" },
      { code: "IT404", name: "Blockchain Architecture", credits: 4, grade: "A+" }
    ]
  },
  {
    id: "DEMO-07",
    filename: "Demo_Degree_Arjun_Nair.pdf",
    studentName: "Arjun Nair",
    registerNumber: "BHU2026CE722",
    institution: "Bluehaven University",
    programme: "B.Tech Civil Engineering",
    credentialType: "Degree Certificate",
    cgpa: "8.28",
    academicYear: "2022 - 2026",
    issueDate: "July 10, 2026",
    courses: [
      { code: "CE101", name: "Structural Analysis & Design", credits: 4, grade: "A" },
      { code: "CE202", name: "Geotechnical Engineering", credits: 4, grade: "B+" },
      { code: "CE303", name: "Transportation Systems", credits: 3, grade: "A" },
      { code: "CE404", name: "Environmental Engineering", credits: 4, grade: "A+" }
    ]
  },
  {
    id: "DEMO-08",
    filename: "Demo_Transcript_Meera_Krishnan.pdf",
    studentName: "Meera Krishnan",
    registerNumber: "EIS2026BT833",
    institution: "Eastbridge Institute of Science",
    programme: "B.Tech Biotechnology",
    credentialType: "Academic Transcript",
    cgpa: "9.01",
    academicYear: "2022 - 2026",
    issueDate: "June 22, 2026",
    courses: [
      { code: "BT101", name: "Genetic Engineering", credits: 4, grade: "O" },
      { code: "BT202", name: "Bioinformatics & Genomics", credits: 4, grade: "A+" },
      { code: "BT303", name: "Bioprocess Engineering", credits: 3, grade: "A+" },
      { code: "BT404", name: "Immunology & Vaccine Design", credits: 4, grade: "O" }
    ]
  },
  {
    id: "DEMO-09",
    filename: "Demo_Migration_Vivek_Patel.pdf",
    studentName: "Vivek Patel",
    registerNumber: "OTU2026CA944",
    institution: "Oakridge Technical University",
    programme: "B.Com Computer Applications",
    credentialType: "Migration Certificate",
    cgpa: "8.56",
    academicYear: "2023 - 2026",
    issueDate: "June 05, 2026",
    courses: [
      { code: "CA101", name: "Financial Accounting & ERP", credits: 4, grade: "A+" },
      { code: "CA102", name: "Business Analytics", credits: 3, grade: "A" },
      { code: "CA103", name: "Database Applications", credits: 3, grade: "A+" },
      { code: "CA104", name: "Corporate Finance", credits: 3, grade: "A" }
    ]
  },
  {
    id: "DEMO-10",
    filename: "Demo_Transcript_Sanjana_Reddy.pdf",
    studentName: "Sanjana Reddy",
    registerNumber: "VIT2026EE055",
    institution: "Vertex Institute of Technology",
    programme: "B.Tech Electronics Engineering",
    credentialType: "Academic Transcript",
    cgpa: "9.26",
    academicYear: "2022 - 2026",
    issueDate: "June 28, 2026",
    courses: [
      { code: "EE101", name: "Power Systems & Renewable Energy", credits: 4, grade: "O" },
      { code: "EE202", name: "Microcontrollers & IoT", credits: 4, grade: "O" },
      { code: "EE303", name: "Control Systems", credits: 3, grade: "A+" },
      { code: "EE404", name: "Electric Vehicle Technologies", credits: 4, grade: "A+" }
    ]
  }
];

async function createCredentialPDF(item, isTampered = false) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const displayCgpa = isTampered ? item.tamperedCgpa || "9.90" : item.cgpa;

  // Background Header Banner
  page.drawRectangle({
    x: 30,
    y: height - 125,
    width: width - 60,
    height: 95,
    color: rgb(0.06, 0.09, 0.16) // #0f172a
  });

  // Institution Title
  page.drawText(item.institution.toUpperCase(), {
    x: 50,
    y: height - 60,
    size: 16,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1)
  });

  page.drawText("OFFICE OF THE REGISTRAR & CONTROLLER OF EXAMINATIONS", {
    x: 50,
    y: height - 78,
    size: 8.5,
    font: fontHelvetica,
    color: rgb(0.8, 0.85, 0.95)
  });

  page.drawText("Accredited Autonomous Institution • Blockchain Verified Academic Ledger", {
    x: 50,
    y: height - 95,
    size: 7.5,
    font: fontHelveticaOblique,
    color: rgb(0.6, 0.7, 0.85)
  });

  // Watermark Banner
  page.drawRectangle({
    x: 30,
    y: height - 150,
    width: width - 60,
    height: 20,
    color: isTampered ? rgb(0.98, 0.88, 0.88) : rgb(0.9, 0.94, 0.99)
  });

  page.drawText(
    isTampered
      ? `*** TAMPERED DEMO RECORD: CGPA ALTERED TO ${displayCgpa} - NOT AN OFFICIAL RECORD ***`
      : "SAMPLE / DEMO DOCUMENT — NOT AN OFFICIAL ACADEMIC RECORD",
    {
      x: 50,
      y: height - 143,
      size: 8.5,
      font: fontHelveticaBold,
      color: isTampered ? rgb(0.75, 0.1, 0.1) : rgb(0.12, 0.35, 0.65)
    }
  );

  // Document Title
  page.drawText(`OFFICIAL ${item.credentialType.toUpperCase()}`, {
    x: 50,
    y: height - 180,
    size: 15,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  // Student Details Box
  page.drawRectangle({
    x: 30,
    y: height - 295,
    width: width - 60,
    height: 95,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1
  });

  const detailsY = height - 210;
  const col1X = 50;
  const col2X = 320;

  page.drawText("Student Name:", { x: col1X, y: detailsY, size: 9, font: fontHelvetica, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(item.studentName, { x: col1X + 90, y: detailsY, size: 10, font: fontHelveticaBold, color: rgb(0.1, 0.15, 0.25) });

  page.drawText("Register Number:", { x: col2X, y: detailsY, size: 9, font: fontHelvetica, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(item.registerNumber, { x: col2X + 95, y: detailsY, size: 10, font: fontHelveticaBold, color: rgb(0.1, 0.15, 0.25) });

  page.drawText("Programme:", { x: col1X, y: detailsY - 22, size: 9, font: fontHelvetica, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(item.programme, { x: col1X + 90, y: detailsY - 22, size: 9.5, font: fontHelveticaBold, color: rgb(0.1, 0.15, 0.25) });

  page.drawText("Academic Year:", { x: col2X, y: detailsY - 22, size: 9, font: fontHelvetica, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(item.academicYear, { x: col2X + 95, y: detailsY - 22, size: 9.5, font: fontHelvetica, color: rgb(0.1, 0.15, 0.25) });

  page.drawText("Issue Date:", { x: col1X, y: detailsY - 44, size: 9, font: fontHelvetica, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(item.issueDate, { x: col1X + 90, y: detailsY - 44, size: 9.5, font: fontHelvetica, color: rgb(0.1, 0.15, 0.25) });

  page.drawText("Cumulative GPA:", { x: col2X, y: detailsY - 44, size: 9, font: fontHelvetica, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(`${displayCgpa} / 10.00`, {
    x: col2X + 95,
    y: detailsY - 44,
    size: 11,
    font: fontHelveticaBold,
    color: isTampered ? rgb(0.8, 0.1, 0.1) : rgb(0.05, 0.55, 0.3)
  });

  // Coursework / Academic Assessment Table
  page.drawText("ACADEMIC PERFORMANCE SUMMARY", {
    x: 50,
    y: height - 325,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.15, 0.2, 0.3)
  });

  // Table Header
  const tableTop = height - 345;
  page.drawRectangle({
    x: 30,
    y: tableTop - 18,
    width: width - 60,
    height: 22,
    color: rgb(0.15, 0.23, 0.36)
  });

  page.drawText("Course Code", { x: 45, y: tableTop - 12, size: 9, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Course Title", { x: 130, y: tableTop - 12, size: 9, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Credits", { x: 430, y: tableTop - 12, size: 9, font: fontHelveticaBold, color: rgb(1, 1, 1) });
  page.drawText("Grade", { x: 510, y: tableTop - 12, size: 9, font: fontHelveticaBold, color: rgb(1, 1, 1) });

  // Rows
  let rowY = tableTop - 40;
  for (let i = 0; i < item.courses.length; i++) {
    const course = item.courses[i];
    const isEven = i % 2 === 0;

    page.drawRectangle({
      x: 30,
      y: rowY - 6,
      width: width - 60,
      height: 22,
      color: isEven ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1),
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5
    });

    page.drawText(course.code, { x: 45, y: rowY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.25, 0.35) });
    page.drawText(course.name, { x: 130, y: rowY, size: 9, font: fontHelvetica, color: rgb(0.2, 0.25, 0.35) });
    page.drawText(course.credits.toString(), { x: 440, y: rowY, size: 9, font: fontHelvetica, color: rgb(0.2, 0.25, 0.35) });
    page.drawText(course.grade, { x: 515, y: rowY, size: 9.5, font: fontHelveticaBold, color: rgb(0.05, 0.5, 0.3) });

    rowY -= 24;
  }

  // Footer & Security Seals
  const footerY = 160;
  page.drawRectangle({
    x: 30,
    y: 50,
    width: width - 60,
    height: footerY,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1
  });

  page.drawText("BLOCKCHAIN REGISTRY ATTESTATION & INTEGRITY SEAL", {
    x: 50,
    y: 190,
    size: 9.5,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  page.drawText("This synthetic document was generated for demonstration purposes of CredentialChain.", {
    x: 50,
    y: 175,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  page.drawText("The cryptographic SHA-256 fingerprint of this document can be validated against the", {
    x: 50,
    y: 162,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  page.drawText("Ethereum EVM AcademicCredentialRegistry smart contract.", {
    x: 50,
    y: 149,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.4, 0.45, 0.5)
  });

  // Signature Placeholders
  page.drawLine({
    start: { x: 50, y: 95 },
    end: { x: 220, y: 95 },
    thickness: 1,
    color: rgb(0.6, 0.65, 0.7)
  });
  page.drawText("Controller of Examinations", { x: 50, y: 80, size: 8.5, font: fontHelveticaBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(item.institution, { x: 50, y: 68, size: 7.5, font: fontHelvetica, color: rgb(0.5, 0.55, 0.6) });

  page.drawLine({
    start: { x: 370, y: 95 },
    end: { x: 540, y: 95 },
    thickness: 1,
    color: rgb(0.6, 0.65, 0.7)
  });
  page.drawText("Registrar & Academic Dean", { x: 370, y: 80, size: 8.5, font: fontHelveticaBold, color: rgb(0.3, 0.35, 0.4) });
  page.drawText("Autonomous Academic Board", { x: 370, y: 68, size: 7.5, font: fontHelvetica, color: rgb(0.5, 0.55, 0.6) });

  // Big Watermark across page
  page.drawText("DEMO / SAMPLE DOCUMENT", {
    x: 75,
    y: 390,
    size: 34,
    font: fontHelveticaBold,
    color: rgb(0.85, 0.88, 0.92),
    rotate: { type: "degrees", angle: 30 }
  });

  return await pdfDoc.save();
}

async function main() {
  console.log("==================================================");
  console.log(" Generating 10 Synthetic Demo PDFs + 3 Tampered   ");
  console.log("==================================================");

  const demoAssetsDir = path.join(__dirname, "../demo-assets");
  const publicDir = path.join(__dirname, "../frontend/public/demo-assets");
  const downloadsDir = "C:\\Users\\KESHAV\\Downloads";

  if (!fs.existsSync(demoAssetsDir)) fs.mkdirSync(demoAssetsDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const catalog = [];

  for (let i = 0; i < DEMO_ITEMS.length; i++) {
    const item = DEMO_ITEMS[i];

    // 1. Generate Authentic PDF
    const authenticBytes = await createCredentialPDF(item, false);
    const authenticSha256 = crypto.createHash("sha256").update(authenticBytes).digest("hex");
    const authenticPath = path.join(demoAssetsDir, item.filename);
    fs.writeFileSync(authenticPath, authenticBytes);
    fs.writeFileSync(path.join(publicDir, item.filename), authenticBytes);
    try { fs.writeFileSync(path.join(downloadsDir, item.filename), authenticBytes); } catch (e) {}

    console.log(`[${i + 1}/10] Created ${item.filename} (Hash: ${authenticSha256.slice(0, 16)}...)`);

    const entry = {
      id: item.id,
      filename: item.filename,
      studentName: item.studentName,
      registerNumber: item.registerNumber,
      institution: item.institution,
      programme: item.programme,
      credentialType: item.credentialType,
      cgpa: item.cgpa,
      sha256: authenticSha256,
      academicYear: item.academicYear,
      issueDate: item.issueDate,
      isTampered: false,
      description: `Official authentic demo ${item.credentialType.toLowerCase()} for ${item.studentName}`
    };

    catalog.push(entry);

    // 2. Generate Tampered PDF if specified (3 tampered files)
    if (item.tamperedFilename) {
      const tamperedBytes = await createCredentialPDF(item, true);
      const tamperedSha256 = crypto.createHash("sha256").update(tamperedBytes).digest("hex");
      const tamperedPath = path.join(demoAssetsDir, item.tamperedFilename);
      fs.writeFileSync(tamperedPath, tamperedBytes);
      fs.writeFileSync(path.join(publicDir, item.tamperedFilename), tamperedBytes);
      try { fs.writeFileSync(path.join(downloadsDir, item.tamperedFilename), tamperedBytes); } catch (e) {}

      console.log(`       -> Created Tampered version: ${item.tamperedFilename} (Hash: ${tamperedSha256.slice(0, 16)}...)`);

      catalog.push({
        id: `${item.id}-TAMPERED`,
        filename: item.tamperedFilename,
        originalFilename: item.filename,
        studentName: item.studentName,
        registerNumber: item.registerNumber,
        institution: item.institution,
        programme: item.programme,
        credentialType: item.credentialType,
        cgpa: item.tamperedCgpa,
        originalCgpa: item.cgpa,
        sha256: tamperedSha256,
        academicYear: item.academicYear,
        issueDate: item.issueDate,
        isTampered: true,
        description: `Tampered copy of ${item.studentName}'s transcript with CGPA altered from ${item.cgpa} to ${item.tamperedCgpa}`
      });
    }
  }

  // Save demo catalog JSON
  const catalogPath = path.join(demoAssetsDir, "demo-credentials.json");
  const publicCatalogPath = path.join(publicDir, "demo-credentials.json");
  const backendCatalogPath = path.join(__dirname, "../backend/data/demo-credentials.json");

  const catalogData = {
    version: "1.0.0",
    totalDemoFiles: catalog.length,
    authenticCount: catalog.filter((c) => !c.isTampered).length,
    tamperedCount: catalog.filter((c) => c.isTampered).length,
    generatedAt: new Date().toISOString(),
    credentials: catalog
  };

  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));
  fs.writeFileSync(publicCatalogPath, JSON.stringify(catalogData, null, 2));
  if (!fs.existsSync(path.dirname(backendCatalogPath))) fs.mkdirSync(path.dirname(backendCatalogPath), { recursive: true });
  fs.writeFileSync(backendCatalogPath, JSON.stringify(catalogData, null, 2));

  console.log("\n==================================================");
  console.log(` Successfully generated ${catalog.length} total demo assets!`);
  console.log(` - 10 Authentic Certificates`);
  console.log(` - 3 Tampered Demonstration Certificates`);
  console.log(` Catalog saved to demo-assets/demo-credentials.json`);
  console.log("==================================================\n");
}

main().catch(console.error);
