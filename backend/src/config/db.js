const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "credentials.json");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ credentials: [], auditLogs: [], users: [] }, null, 2), "utf8");
}

class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.cache = null;
    this.load();
    this.seedDemoUsers();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8");
        this.cache = JSON.parse(raw);
        if (!this.cache.credentials) this.cache.credentials = [];
        if (!this.cache.auditLogs) this.cache.auditLogs = [];
        if (!this.cache.users) this.cache.users = [];
      } else {
        this.cache = { credentials: [], auditLogs: [], users: [] };
      }
    } catch (err) {
      console.error("Database load error, initializing fresh store:", err.message);
      this.cache = { credentials: [], auditLogs: [], users: [] };
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

  // --- Users & Authentication Collection ---
  seedDemoUsers() {
    try {
      const demoUsers = [
        {
          id: "USR-STUDENT-DEMO-001",
          name: "Keshav Demo",
          email: "student@credentialchain.demo",
          passwordHash: bcrypt.hashSync("Demo@123", 10),
          role: "Student",
          registerNumber: "VIT2026DEMO",
          programme: "B.Tech Electronics & Communication Engineering",
          walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          avatarType: "preset",
          avatarValue: "avatar-1",
          avatarUrl: "",
          isDemo: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "USR-INSTITUTION-DEMO-002",
          name: "Dr. Arvind Registrar",
          email: "institution@credentialchain.demo",
          passwordHash: bcrypt.hashSync("Demo@123", 10),
          role: "Institution",
          institutionName: "CredentialChain Autonomous University",
          institutionCode: "CCU-DEMO-2026",
          issuerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          avatarType: "preset",
          avatarValue: "avatar-3",
          avatarUrl: "",
          isDemo: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "USR-VERIFIER-DEMO-003",
          name: "Global Background Verifier",
          email: "verifier@credentialchain.demo",
          passwordHash: bcrypt.hashSync("Demo@123", 10),
          role: "Verifier",
          organizationName: "Global Talent & Background Verification Corp",
          avatarType: "preset",
          avatarValue: "avatar-5",
          avatarUrl: "",
          isDemo: true,
          createdAt: new Date().toISOString()
        }
      ];

      let modified = false;
      for (const demo of demoUsers) {
        const existingIdx = this.cache.users.findIndex((u) => u.email.toLowerCase() === demo.email.toLowerCase());
        if (existingIdx === -1) {
          this.cache.users.push(demo);
          modified = true;
        } else {
          this.cache.users[existingIdx] = {
            ...this.cache.users[existingIdx],
            ...demo,
            passwordHash: demo.passwordHash
          };
          modified = true;
        }
      }

      if (modified) {
        this.save();
      }
    } catch (err) {
      console.warn("Demo user seed warning:", err.message);
    }
  }

  findUserByEmail(email) {
    if (!email) return null;
    this.load();
    return this.cache.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    this.load();
    return this.cache.users.find((u) => u.id === id) || null;
  }

  createUser(userData) {
    this.load();
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error(`Email "${userData.email}" is already registered. Please sign in.`);
    }

    const record = {
      id: `USR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      avatarType: userData.avatarType || "initials",
      avatarValue: userData.avatarValue || "",
      avatarUrl: userData.avatarUrl || "",
      ...userData,
      createdAt: new Date().toISOString()
    };

    this.cache.users.push(record);
    this.save();
    return record;
  }

  updateUser(id, updates) {
    this.load();
    const idx = this.cache.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    this.cache.users[idx] = {
      ...this.cache.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.cache.users[idx];
  }

  getAllUsers() {
    this.load();
    return this.cache.users.map(({ passwordHash, ...safeUser }) => safeUser);
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

  /**
   * User-Isolated Credentials Query
   * Returns ONLY credentials belonging to the authenticated student
   */
  findCredentialsByStudent(user) {
    this.load();
    if (!user) return [];

    const isDemoUser = user.isDemo === true || user.email.toLowerCase() === "student@credentialchain.demo";

    if (isDemoUser) {
      // Demo student sees only demo credentials
      return this.cache.credentials
        .filter((c) => {
          const isDemoCred =
            c.studentEmail === "student@credentialchain.demo" ||
            c.registerNumber === "VIT2026DEMO" ||
            c.credentialId.includes("VIT2026DEMO") ||
            c.credentialId.includes("VITDEMO");
          return isDemoCred;
        })
        .reverse();
    }

    // Real student sees ONLY credentials explicitly issued to their email, userId, or registration number
    const userEmail = (user.email || "").toLowerCase().trim();
    const userReg = (user.registerNumber || "").toLowerCase().trim();
    const userName = (user.name || "").toLowerCase().trim();
    const userId = user.id;

    return this.cache.credentials
      .filter((c) => {
        // Exclude demo credentials
        if (c.registerNumber === "VIT2026DEMO" && !isDemoUser) return false;

        // Match by explicit studentEmail
        if (c.studentEmail && c.studentEmail.toLowerCase().trim() === userEmail) {
          return true;
        }

        // Match by studentUserId
        if (c.studentUserId && c.studentUserId === userId) {
          return true;
        }

        // Match by exact registration number and name
        if (userReg && c.registerNumber && c.registerNumber.toLowerCase().trim() === userReg) {
          if (!userName || (c.studentName && c.studentName.toLowerCase().trim() === userName)) {
            return true;
          }
        }

        return false;
      })
      .reverse();
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
