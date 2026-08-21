const crypto = require("crypto");
const fs = require("fs");

class HashService {
  /**
   * Calculate SHA-256 fingerprint from buffer
   * @param {Buffer} buffer 
   * @returns {string} 64-character lowercase hex string
   */
  calculateSha256(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Input must be a valid Buffer");
    }
    return crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
  }

  /**
   * Calculate SHA-256 from a file on disk
   * @param {string} filePath 
   * @returns {string} 64-character lowercase hex string
   */
  calculateFileSha256(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    const buffer = fs.readFileSync(filePath);
    return this.calculateSha256(buffer);
  }

  /**
   * Convert hex string to 0x-prefixed bytes32 for Solidity smart contract
   * @param {string} hex 
   * @returns {string} 0x-prefixed 64-character hex string (32 bytes)
   */
  toBytes32(hex) {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (clean.length !== 64) {
      throw new Error(`Invalid SHA-256 hex length: ${clean.length}. Expected 64 characters (32 bytes).`);
    }
    return "0x" + clean.toLowerCase();
  }

  /**
   * Check if two hashes match regardless of 0x prefix or case
   * @param {string} hash1 
   * @param {string} hash2 
   * @returns {boolean}
   */
  compareHashes(hash1, hash2) {
    if (!hash1 || !hash2) return false;
    const clean1 = (hash1.startsWith("0x") ? hash1.slice(2) : hash1).toLowerCase().trim();
    const clean2 = (hash2.startsWith("0x") ? hash2.slice(2) : hash2).toLowerCase().trim();
    return clean1 === clean2;
  }
}

module.exports = new HashService();
