const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "credentials.json");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ credentials: [], auditLogs: [] }, null, 2), "utf8");
}

class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.cache = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8");
        this.cache = JSON.parse(raw);
      } else {
        this.cache = { credentials: [], auditLogs: [] };
      }
    } catch (err) {
      console.error("Database load error, initializing fresh store:", err.message);
      this.cache = { credentials: [], auditLogs: [] };
    }
  }

  save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.cache, null, 2), "utf8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error("Database atomic save error:", err.message);
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), "utf8");
    }
  }

  // --- Credentials Collection ---
  findCredentialById(id) {
    this.load();
    return this.cache.credentials.find((c) => c.credentialId.toLowerCase() === id.toLowerCase()) || null;
  }

  findCredentialByHash(hash) {
    this.load();
    const cleanHash = hash.startsWith("0x") ? hash.slice(2).toLowerCase() : hash.toLowerCase();
    return (
      this.cache.credentials.find((c) => {
        const docHashClean = c.documentHash.startsWith("0x") ? c.documentHash.slice(2).toLowerCase() : c.documentHash.toLowerCase();
        return docHashClean === cleanHash;
      }) || null
    );
  }

  getAllCredentials() {
    this.load();
    return [...this.cache.credentials].reverse(); // newest first
  }

  insertCredential(credential) {
    this.load();
    const existing = this.findCredentialById(credential.credentialId);
    if (existing) {
      throw new Error(`Credential ID ${credential.credentialId} already exists in database`);
    }

    const record = {
      ...credential,
      createdAt: credential.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.cache.credentials.push(record);
    this.save();
    return record;
  }

  updateCredential(id, updates) {
    this.load();
    const idx = this.cache.credentials.findIndex((c) => c.credentialId.toLowerCase() === id.toLowerCase());
    if (idx === -1) {
      return null;
    }

    this.cache.credentials[idx] = {
      ...this.cache.credentials[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.cache.credentials[idx];
  }

  // --- Audit Logs Collection ---
  addAuditLog(action, details) {
    this.load();
    const log = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.cache.auditLogs.push(log);
    this.save();
    return log;
  }

  getAuditLogs() {
    this.load();
    return [...this.cache.auditLogs].reverse();
  }
}

const db = new JsonDatabase(DB_FILE);

module.exports = db;
