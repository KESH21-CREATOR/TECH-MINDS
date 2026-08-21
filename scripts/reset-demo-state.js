const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function main() {
  console.log("==================================================");
  console.log("   Resetting CredentialChain Demo to Fresh State  ");
  console.log("==================================================");

  // 1. Deploy Contract
  const [deployer] = await hre.ethers.getSigners();
  const defaultInstitution = "CredentialChain Demo University";
  const RegistryFactory = await hre.ethers.getContractFactory("AcademicCredentialRegistry");
  const registry = await RegistryFactory.deploy(defaultInstitution);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("1. New Contract Deployed at:", contractAddress);

  // 2. Save Configs
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AcademicCredentialRegistry.sol/AcademicCredentialRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const configData = {
    contractAddress: contractAddress,
    abi: artifact.abi || [],
    networkName: "localhost",
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    defaultInstitution: defaultInstitution,
    deployerAddress: deployer.address,
    rpcUrl: "http://127.0.0.1:8545"
  };

  fs.writeFileSync(path.join(__dirname, "../backend/src/config/contractConfig.json"), JSON.stringify(configData, null, 2));
  fs.writeFileSync(path.join(__dirname, "../frontend/src/contractConfig.json"), JSON.stringify(configData, null, 2));

  // 3. Issue Single Authentic Credential for Keshav Demo
  const pdfPath = path.join(__dirname, "../demo-assets/Keshav_Demo_Transcript.pdf");
  const pdfBytes = fs.readFileSync(pdfPath);
  const docHashHex = crypto.createHash("sha256").update(pdfBytes).digest("hex");
  const docHashBytes32 = "0x" + docHashHex;
  const credId = "CRED-2026-VITDEMO-001";
  const studentWallet = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  console.log("2. Issuing Authentic Credential:", credId);
  console.log("   SHA-256 Digest:", docHashHex);

  const tx = await registry.issueCredential(
    credId,
    docHashBytes32,
    "Academic Transcript",
    studentWallet,
    "offchain://records/CRED-2026-VITDEMO-001"
  );
  const receipt = await tx.wait(1);

  console.log("   Tx Hash:", tx.hash);
  console.log("   Block Number:", receipt.blockNumber);

  // 4. Save clean database
  const cleanDb = {
    credentials: [
      {
        credentialId: credId,
        studentName: "Keshav Demo",
        registerNumber: "VIT2026DEMO",
        programme: "B.Tech Electronics and Communication Engineering",
        cgpa: "8.90",
        graduationYear: "2026",
        credentialType: "Academic Transcript",
        documentHash: docHashHex,
        documentHashBytes32: docHashBytes32,
        originalFileName: "Keshav_Demo_Transcript.pdf",
        storedFileName: "Keshav_Demo_Transcript.pdf",
        fileSize: pdfBytes.length,
        mimeType: "application/pdf",
        filePath: "/demo-assets/Keshav_Demo_Transcript.pdf",
        status: "ACTIVE",
        institutionName: defaultInstitution,
        issuerAddress: deployer.address,
        recipientWallet: studentWallet,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        issuedTimestamp: Math.floor(Date.now() / 1000),
        notes: "Official transcript for Keshav Demo graduation verification.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revokedAt: null
      }
    ],
    auditLogs: [
      {
        id: `LOG-${Date.now()}-init`,
        action: "CREDENTIAL_ISSUED",
        details: { credentialId: credId, documentSha256: docHashHex, txHash: tx.hash },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(path.join(__dirname, "../backend/data/credentials.json"), JSON.stringify(cleanDb, null, 2));

  console.log("\n==================================================");
  console.log("  Fresh Demo State Ready with 1 Active Credential! ");
  console.log("==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Reset error:", e);
    process.exit(1);
  });
