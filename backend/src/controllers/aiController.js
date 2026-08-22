const fs = require("fs");
const path = require("path");
const aiService = require("../services/aiService");
const documentAnalysisService = require("../services/documentAnalysisService");
const { DEMO_ASSETS_DIR } = require("../services/storageService");

class AIController {
  /**
   * Conversational Assistant Chat Endpoint
   * POST /api/ai/chat
   */
  async chat(req, res) {
    try {
      const { message, context = {} } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          success: false,
          error: "Message string is required."
        });
      }

      const response = await aiService.chat({ message, context });

      return res.json({
        success: true,
        data: response
      });
    } catch (err) {
      console.error("AI Chat error:", err);
      return res.status(500).json({
        success: false,
        error: "AI service encountered an error: " + err.message
      });
    }
  }

  /**
   * Explain Verification Verdict in Natural Language
   * POST /api/ai/explain-verdict
   */
  explainVerdict(req, res) {
    try {
      const { verdict, details } = req.body;

      if (!verdict) {
        return res.status(400).json({
          success: false,
          error: "Verification verdict is required."
        });
      }

      const explanation = aiService.explainVerdict({ verdict, details });

      return res.json({
        success: true,
        data: explanation
      });
    } catch (err) {
      console.error("Explain verdict error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to generate verdict explanation: " + err.message
      });
    }
  }

  /**
   * AI-Assisted Document Structure & Consistency Analysis
   * POST /api/ai/analyze-document
   */
  async analyzeDocument(req, res) {
    try {
      const { credentialId, demoModeType } = req.body;
      const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

      let buffer = null;
      let filePath = null;

      if (uploadedFile) {
        filePath = uploadedFile.path;
        buffer = fs.readFileSync(filePath);
      } else if (demoModeType) {
        const filename = demoModeType.endsWith(".pdf")
          ? demoModeType
          : demoModeType === "tampered"
          ? "Keshav_Demo_Transcript_Tampered.pdf"
          : "Keshav_Demo_Transcript.pdf";

        filePath = path.join(DEMO_ASSETS_DIR, filename);
        if (fs.existsSync(filePath)) {
          buffer = fs.readFileSync(filePath);
        }
      }

      const analysis = await documentAnalysisService.analyzeDocument({
        filePath,
        buffer,
        credentialId,
        demoModeType
      });

      return res.json({
        success: true,
        data: analysis
      });
    } catch (err) {
      console.error("Document analysis error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to analyze document: " + err.message
      });
    }
  }

  /**
   * Get List of all 10 Demo Credentials + 3 Tampered
   * GET /api/demo/credentials
   */
  getDemoCredentialsCatalog(req, res) {
    try {
      const catalogPath = path.join(__dirname, "../../data/demo-credentials.json");
      if (fs.existsSync(catalogPath)) {
        const data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
        return res.json({
          success: true,
          data: data.credentials || []
        });
      }

      return res.json({
        success: true,
        data: []
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to load demo catalog: " + err.message
      });
    }
  }
}

module.exports = new AIController();
