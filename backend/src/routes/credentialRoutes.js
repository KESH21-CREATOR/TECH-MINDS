const express = require("express");
const router = express.Router();
const credentialController = require("../controllers/credentialController");
const { upload } = require("../services/storageService");

const { authenticateToken } = require("../middleware/authMiddleware");

// Health check
router.get("/health", (req, res) => credentialController.getHealth(req, res));

// User-Specific Credentials (Student Wallet)
router.get("/credentials/my", authenticateToken, (req, res) =>
  credentialController.getMyCredentials(req, res)
);

// Credential Issuance (supports any file field name: document, file, pdf, etc.)
router.post("/credentials/issue", upload.any(), (req, res) =>
  credentialController.issueCredential(req, res)
);

// Credential Verification (supports any file field name: document, file, pdf, etc.)
router.post("/credentials/verify", upload.any(), (req, res) =>
  credentialController.verifyCredential(req, res)
);

// Get all credentials
router.get("/credentials", (req, res) => credentialController.getAllCredentials(req, res));

// Get single credential by ID
router.get("/credentials/:id", (req, res) => credentialController.getCredentialById(req, res));

// Revoke a credential
router.post("/credentials/:id/revoke", (req, res) => credentialController.revokeCredential(req, res));

// Demo helpers
router.get("/demo/prefill", (req, res) => credentialController.getDemoPrefill(req, res));
router.get("/demo/assets/:filename", (req, res) => credentialController.downloadDemoAsset(req, res));

module.exports = router;
