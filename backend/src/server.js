require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const credentialRoutes = require("./routes/credentialRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const blockchainService = require("./services/blockchainService");

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Serve uploaded documents statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount API Routes
app.use("/api", credentialRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express Global Error:", err);
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File upload size exceeded limit (Max 15MB allowed)."
      });
    }
  }
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const server = app.listen(PORT, async () => {
  console.log("==================================================");
  console.log("    CredentialChain Verification Backend API      ");
  console.log("==================================================");
  console.log(` Server running on        : http://localhost:${PORT}`);
  console.log(` API Health endpoint     : http://localhost:${PORT}/api/health`);
  console.log(` Authentication endpoint : http://localhost:${PORT}/api/auth/signin`);
  console.log(` AI Assistant endpoint   : http://localhost:${PORT}/api/ai/chat`);
  console.log(` Blockchain RPC endpoint : ${process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545"}`);
  console.log(` Contract Address        : ${blockchainService.contractAddress || "Pending deployment"}`);
  console.log("==================================================\n");
});

module.exports = { app, server };
