const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { upload } = require("../services/storageService");

// Conversational Chatbot Endpoint
router.post("/chat", (req, res) => aiController.chat(req, res));

// Explain Verification Verdict
router.post("/explain-verdict", (req, res) => aiController.explainVerdict(req, res));

// Analyze Document Structure & Consistency (supports optional PDF upload)
router.post("/analyze-document", upload.any(), (req, res) => aiController.analyzeDocument(req, res));

// Get All 10 Demo Credentials + 3 Tampered
router.get("/demo-catalog", (req, res) => aiController.getDemoCredentialsCatalog(req, res));

module.exports = router;
