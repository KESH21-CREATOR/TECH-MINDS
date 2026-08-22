const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const hashService = require("../services/hashService");
const blockchainService = require("../services/blockchainService");
const db = require("../config/db");
const { DEMO_PREFILL } = require("../utils/demoData");
const { DEMO_ASSETS_DIR } = require("../services/storageService");

class CredentialController {
  /**
   * Health Check Endpoint
   * GET /api/health
   */
  async getHealth(req, res) {
    try {
      const bcHealth = await blockchainService.getHealth();
      const allCreds = db.getAllCredentials();

      return res.json({
        status: "ok",
        service: "credentialchain-backend",
        timestamp: new Date().toISOString(),
        blockchain: bcHealth.blockchain,
        contract: bcHealth.contract,
        contractAddress: bcHealth.contractAddress,
        network: bcHealth.networkName || "Hardhat Local",
        chainId: bcHealth.chainId || 31337,
        latestBlock: bcHealth.latestBlock || 0,
        issuerWallet: bcHealth.issuerWallet,
        stats: {
          totalLocalCredentials: allCreds.length,
          active: allCreds.filter((c) => c.status === "ACTIVE").length,
          revoked: allCreds.filter((c) => c.status === "REVOKED").length
        }
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        service: "credentialchain-backend",
        error: err.message
      });
    }
  }

  /**
   * Issue a new credential (Supports ANY custom user PDF)
   * POST /api/credentials/issue
   */
  async issueCredential(req, res) {
    try {
      const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          error: "Document file is required. Please upload an official academic PDF."
        });
      }

      // Flexible extraction supporting all common naming conventions
      const studentName =
        req.body.studentName ||
        req.body.student_name ||
        req.body.name ||
        req.body["Student name"] ||
        req.body.student ||
        "Keshav Demo";

      const registerNumber =
        req.body.registerNumber ||
        req.body.register_number ||
        req.body.registrationNumber ||
        req.body.regNo ||
        req.body["Register number"] ||
        req.body.rollNo ||
        req.body.rollNumber ||
        "VIT2026DEMO";

      const programme =
        req.body.programme ||
        req.body.program ||
        req.body.degree ||
        req.body["Degree / Programme"] ||
        req.body.degreeProgramme ||
        req.body.course ||
        "B.Tech Electronics and Communication Engineering";

      const cgpa = req.body.cgpa || req.body.gpa || req.body.grade || req.body.CGPA || "8.90";
      const graduationYear = req.body.graduationYear || req.body.graduation_year || req.body.year || "2026";
      const credentialType =
        req.body.credentialType ||
        req.body.credential_type ||
        req.body.type ||
        req.body["Credential type"] ||
        "Academic Transcript";

      const recipientWallet =
        req.body.recipientWallet ||
        req.body.recipient_wallet ||
        req.body.wallet ||
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

      const institutionName =
        req.body.institutionName ||
        req.body.institution_name ||
        process.env.DEFAULT_INSTITUTION_NAME ||
        "CredentialChain Demo University";

      const aadharNumber = req.body.aadharNumber || req.body.aadhar || req.body.aadhaar || "";
      const notes = req.body.notes || "";

      // Exact cryptographic SHA-256 fingerprint of the uploaded PDF file
      const fileBuffer = fs.readFileSync(uploadedFile.path);
      const documentSha256 = hashService.calculateSha256(fileBuffer);
      const documentBytes32 = hashService.toBytes32(documentSha256);

      // Check if this EXACT document hash has already been registered on-chain
      try {
        const existingLookup = await blockchainService.getCredentialByHashFromChain(documentSha256);
        if (existingLookup && existingLookup.found) {
          const existingLocal = db.findCredentialById(existingLookup.credentialId) || {
            credentialId: existingLookup.credentialId,
            studentName,
            registerNumber,
            programme,
            cgpa,
            graduationYear,
            credentialType,
            documentHash: documentSha256,
            documentHashBytes32: documentBytes32,
            originalFileName: uploadedFile.originalname,
            status: existingLookup.status || "ACTIVE",
            institutionName,
            issuerAddress: existingLookup.issuer
          };

          return res.status(200).json({
            success: true,
            message: `This exact document is already registered on the blockchain under Credential ID ${existingLookup.credentialId}.`,
            data: existingLocal,
            alreadyRegistered: true
          });
        }
      } catch (checkErr) {
        console.warn("Pre-issuance hash check warning:", checkErr.message);
      }

      // Generate unique credential ID
      const year = graduationYear || new Date().getFullYear();
      const cleanReg = registerNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      let credentialId = req.body.customCredentialId || req.body.credentialId;

      if (!credentialId || db.findCredentialById(credentialId)) {
        let randSuffix = Math.floor(1000 + Math.random() * 9000);
        credentialId = `CRED-${year}-${cleanReg}-${randSuffix}`;
        while (db.findCredentialById(credentialId)) {
          randSuffix = Math.floor(1000 + Math.random() * 9000);
          credentialId = `CRED-${year}-${cleanReg}-${randSuffix}`;
        }
      }

      console.log(`[Issue] Submitting transaction for ${credentialId} (Hash: ${documentSha256})`);

      // Anchor credential hash to smart contract on blockchain
      let txResult;
      try {
        txResult = await blockchainService.issueCredentialOnChain(
          credentialId,
          documentSha256,
          credentialType,
          recipientWallet,
          `offchain://records/${credentialId}`
        );
      } catch (bcErr) {
        console.error("Blockchain issuance error:", bcErr);
        return res.status(500).json({
          success: false,
          error: "Blockchain transaction failed: " + (bcErr.reason || bcErr.message),
          details: bcErr.message
        });
      }

      const studentEmail = (req.body.studentEmail || req.body.email || "").trim().toLowerCase();
      let studentUserId = null;
      if (studentEmail) {
        const foundStudent = db.findUserByEmail(studentEmail);
        if (foundStudent) studentUserId = foundStudent.id;
      }

      // Store off-chain metadata in database
      const credentialRecord = {
        credentialId,
        studentName,
        studentEmail: studentEmail || undefined,
        studentUserId: studentUserId || undefined,
        registerNumber,
        programme,
        cgpa: cgpa || "N/A",
        graduationYear: graduationYear || "2026",
        credentialType,
        documentHash: documentSha256,
        documentHashBytes32: documentBytes32,
        originalFileName: uploadedFile.originalname,
        storedFileName: uploadedFile.filename,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
        filePath: `/uploads/${uploadedFile.filename}`,
        status: "ACTIVE",
        institutionName,
        issuerAddress: txResult.issuer,
        recipientWallet: recipientWallet || null,
        transactionHash: txResult.txHash,
        blockNumber: txResult.blockNumber,
        gasUsed: txResult.gasUsed,
        issuedTimestamp: txResult.issuedAt,
        aadharNumber: aadharNumber ? (aadharNumber.length >= 4 ? `XXXX-XXXX-${aadharNumber.replace(/[\s-]+/g, "").slice(-4)}` : aadharNumber) : undefined,
        notes: notes || ""
      };

      db.insertCredential(credentialRecord);
      db.addAuditLog("CREDENTIAL_ISSUED", { credentialId, documentSha256, txHash: txResult.txHash });

      return res.status(201).json({
        success: true,
        message: "Academic credential successfully issued and registered on blockchain.",
        data: credentialRecord
      });
    } catch (err) {
      console.error("Issue credential controller error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to issue credential: " + err.message
      });
    }
  }

  /**
   * Get credentials belonging specifically to the currently authenticated student
   * GET /api/credentials/my
   */
  async getMyCredentials(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized. Please sign in to view your student wallet."
        });
      }

      let credentials = [];
      if (user.role === "Student") {
        credentials = db.findCredentialsByStudent(user);
      } else {
        // Institution sees all credentials they issued
        credentials = db.getAllCredentials();
      }

      const active = credentials.filter((c) => c.status === "ACTIVE").length;
      const revoked = credentials.filter((c) => c.status === "REVOKED").length;

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          registerNumber: user.registerNumber,
          programme: user.programme,
          avatarUrl: user.avatarUrl
        },
        total: credentials.length,
        active,
        revoked,
        data: credentials
      });
    } catch (err) {
      console.error("getMyCredentials controller error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve student credentials: " + err.message
      });
    }
  }

  /**
   * Verify an academic credential (Supports ANY uploaded custom PDF or Demo PDF)
   * POST /api/credentials/verify
   */
  async verifyCredential(req, res) {
    try {
      const { credentialId, demoModeType } = req.body;
      let uploadedHash = null;
      let fileDetails = null;

      const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

      // 1. Handle Demo Mode Quick Selection
      if (demoModeType) {
        const demoFilename = demoModeType.endsWith(".pdf")
          ? demoModeType
          : demoModeType === "tampered"
          ? "Keshav_Demo_Transcript_Tampered.pdf"
          : "Keshav_Demo_Transcript.pdf";

        const demoFilePath = path.join(DEMO_ASSETS_DIR, demoFilename);
        if (fs.existsSync(demoFilePath)) {
          const buf = fs.readFileSync(demoFilePath);
          uploadedHash = hashService.calculateSha256(buf);
          fileDetails = {
            name: demoFilename,
            size: buf.length,
            isDemoAsset: true
          };
        }
      }

      // 2. Handle Uploaded Custom User PDF File
      if (uploadedFile) {
        const fileBuffer = fs.readFileSync(uploadedFile.path);
        uploadedHash = hashService.calculateSha256(fileBuffer);
        fileDetails = {
          name: uploadedFile.originalname,
          size: uploadedFile.size,
          isDemoAsset: false
        };
      }

      // We need either a credentialId or an uploaded file hash
      if (!credentialId && !uploadedHash) {
        return res.status(400).json({
          success: false,
          error: "Please provide a Credential ID or upload a PDF document for verification."
        });
      }

      // 3. Resolve Credential ID if only document was uploaded
      let targetId = credentialId;
      if (!targetId && uploadedHash) {
        try {
          const lookup = await blockchainService.getCredentialByHashFromChain(uploadedHash);
          if (lookup.found) {
            targetId = lookup.credentialId;
          } else {
            const localRecord = db.findCredentialByHash(uploadedHash);
            if (localRecord) {
              targetId = localRecord.credentialId;
            }
          }
        } catch (lookupErr) {
          console.warn("Hash lookup on chain warning:", lookupErr.message);
        }
      }

      // If document was uploaded with no ID and hash is not found on chain
      if (!targetId) {
        return res.json({
          success: true,
          verdict: "NOT_FOUND",
          status: "NOT_FOUND",
          message:
            "Document fingerprint not found in the blockchain registry. This document has not been registered by an authorized institution yet.",
          details: {
            uploadedDocumentHash: uploadedHash,
            fileDetails,
            isAuthentic: false
          }
        });
      }

      // 4. Query live state from Smart Contract
      let chainRecord = null;
      try {
        chainRecord = await blockchainService.getCredentialFromChain(targetId);
      } catch (err) {
        console.warn(`Smart contract getCredential error for ${targetId}:`, err.message);
      }

      // 5. Query local database metadata
      const localRecord = db.findCredentialById(targetId);

      if (!chainRecord && !localRecord) {
        return res.json({
          success: true,
          verdict: "NOT_FOUND",
          status: "NOT_FOUND",
          message: `Credential ID "${targetId}" was not found in the registry.`,
          details: {
            credentialId: targetId,
            uploadedDocumentHash: uploadedHash,
            fileDetails,
            isAuthentic: false
          }
        });
      }

      const registeredHash = chainRecord
        ? chainRecord.documentHash
        : localRecord
        ? localRecord.documentHash
        : null;
      const onChainStatus = chainRecord ? chainRecord.status : localRecord ? localRecord.status : "UNKNOWN";
      const issuerAddress = chainRecord
        ? chainRecord.issuer
        : localRecord
        ? localRecord.issuerAddress
        : null;
      const issuedAt = chainRecord ? chainRecord.issuedAt : localRecord ? localRecord.issuedTimestamp : null;
      const revokedAt = chainRecord ? chainRecord.revokedAt : null;
      const credentialType = chainRecord
        ? chainRecord.credentialType
        : localRecord
        ? localRecord.credentialType
        : "Academic Transcript";

      // 6. Evaluate Cryptographic Match
      let hashMatches = false;
      if (uploadedHash && registeredHash) {
        hashMatches = hashService.compareHashes(uploadedHash, registeredHash);
      }

      // 7. Determine Final Verdict
      let verdict = "UNKNOWN";
      let verdictDescription = "";

      if (onChainStatus === "REVOKED") {
        verdict = "REVOKED";
        verdictDescription =
          "The issuing educational institution has REVOKED this academic credential. It is no longer legally valid.";
      } else if (uploadedHash && !hashMatches) {
        verdict = "TAMPERED";
        verdictDescription =
          "TAMPER DETECTED: The uploaded document's cryptographic fingerprint does NOT match the registered blockchain hash.";
      } else if (uploadedHash && hashMatches && onChainStatus === "ACTIVE") {
        verdict = "VALID";
        verdictDescription =
          "VERIFIED AUTHENTIC: The document cryptographic SHA-256 fingerprint matches the immutable blockchain record perfectly, and the credential is active.";
      } else if (!uploadedHash && onChainStatus === "ACTIVE") {
        verdict = "RECORD_FOUND";
        verdictDescription =
          "Valid active credential record found on blockchain. Upload the PDF file to verify cryptographic document integrity.";
      }

      db.addAuditLog("CREDENTIAL_VERIFIED", {
        credentialId: targetId,
        verdict,
        uploadedHash,
        registeredHash,
        hashMatches
      });

      return res.json({
        success: true,
        verdict,
        status: onChainStatus,
        message: verdictDescription,
        details: {
          credentialId: targetId,
          studentName: localRecord ? localRecord.studentName : "Registered Student",
          registerNumber: localRecord ? localRecord.registerNumber : "N/A",
          programme: localRecord ? localRecord.programme : "N/A",
          cgpa: localRecord ? localRecord.cgpa : "N/A",
          graduationYear: localRecord ? localRecord.graduationYear : "N/A",
          credentialType,
          institutionName: localRecord ? localRecord.institutionName : "CredentialChain Demo University",
          issuerAddress,
          registeredDocumentHash: registeredHash,
          uploadedDocumentHash: uploadedHash,
          hashesMatch: hashMatches,
          issuedAt: issuedAt ? new Date(issuedAt * 1000).toISOString() : null,
          revokedAt: revokedAt && revokedAt > 0 ? new Date(revokedAt * 1000).toISOString() : null,
          transactionHash: localRecord ? localRecord.transactionHash : null,
          blockNumber: localRecord ? localRecord.blockNumber : null,
          fileDetails
        }
      });
    } catch (err) {
      console.error("Verify credential error:", err);
      return res.status(500).json({
        success: false,
        error: "Verification error: " + err.message
      });
    }
  }

  /**
   * Get single credential by ID
   * GET /api/credentials/:id
   */
  async getCredentialById(req, res) {
    try {
      const { id } = req.params;
      const localRecord = db.findCredentialById(id);

      let chainRecord = null;
      try {
        chainRecord = await blockchainService.getCredentialFromChain(id);
      } catch (chainErr) {
        console.warn(`Chain lookup for ${id}:`, chainErr.message);
      }

      if (!localRecord && !chainRecord) {
        return res.status(404).json({
          success: false,
          error: `Credential with ID ${id} not found.`
        });
      }

      const status = chainRecord ? chainRecord.status : localRecord ? localRecord.status : "ACTIVE";

      const responseData = {
        ...(localRecord || {}),
        credentialId: id,
        status,
        onChain: {
          registered: !!chainRecord,
          issuer: chainRecord ? chainRecord.issuer : localRecord ? localRecord.issuerAddress : null,
          documentHash: chainRecord
            ? chainRecord.documentHash
            : localRecord
            ? localRecord.documentHash
            : null,
          issuedAt: chainRecord ? chainRecord.issuedAt : null,
          revokedAt: chainRecord ? chainRecord.revokedAt : null,
          credentialType: chainRecord
            ? chainRecord.credentialType
            : localRecord
            ? localRecord.credentialType
            : null
        }
      };

      return res.json({
        success: true,
        data: responseData
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch credential: " + err.message
      });
    }
  }

  /**
   * Get all credentials
   * GET /api/credentials
   */
  async getAllCredentials(req, res) {
    try {
      const localList = db.getAllCredentials();

      const enriched = await Promise.all(
        localList.map(async (cred) => {
          try {
            const chain = await blockchainService.getCredentialFromChain(cred.credentialId);
            if (chain) {
              return {
                ...cred,
                status: chain.status,
                revokedAt: chain.revokedAt
              };
            }
          } catch (e) {}
          return cred;
        })
      );

      const total = enriched.length;
      const active = enriched.filter((c) => c.status === "ACTIVE").length;
      const revoked = enriched.filter((c) => c.status === "REVOKED").length;

      return res.json({
        success: true,
        total,
        active,
        revoked,
        data: enriched
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to list credentials: " + err.message
      });
    }
  }

  /**
   * Revoke a credential
   * POST /api/credentials/:id/revoke
   */
  async revokeCredential(req, res) {
    try {
      const { id } = req.params;
      const { reason = "Revoked by issuing authority" } = req.body;

      const localRecord = db.findCredentialById(id);

      console.log(`[Revoke] Submitting revocation for ${id} on blockchain...`);
      const txResult = await blockchainService.revokeCredentialOnChain(id, reason);

      if (localRecord) {
        db.updateCredential(id, {
          status: "REVOKED",
          revokedAt: new Date().toISOString(),
          revocationReason: reason,
          revocationTxHash: txResult.txHash
        });
      }

      db.addAuditLog("CREDENTIAL_REVOKED", { credentialId: id, reason, txHash: txResult.txHash });

      return res.json({
        success: true,
        message: `Credential ${id} has been revoked on the blockchain.`,
        data: {
          credentialId: id,
          status: "REVOKED",
          revocationTxHash: txResult.txHash,
          blockNumber: txResult.blockNumber,
          reason
        }
      });
    } catch (err) {
      console.error("Revoke credential error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to revoke credential: " + (err.reason || err.message)
      });
    }
  }

  /**
   * Demo Data Prefill Helper
   * GET /api/demo/prefill
   */
  getDemoPrefill(req, res) {
    return res.json({
      success: true,
      data: DEMO_PREFILL
    });
  }

  /**
   * Download Demo Sample Assets
   * GET /api/demo/assets/:filename
   */
  downloadDemoAsset(req, res) {
    const { filename } = req.params;
    const safeName = path.basename(filename);
    const filePath = path.join(DEMO_ASSETS_DIR, safeName);

    if (fs.existsSync(filePath)) {
      return res.download(filePath, safeName);
    } else {
      return res.status(404).json({
        success: false,
        error: `Asset ${safeName} not found`
      });
    }
  }
}

module.exports = new CredentialController();
