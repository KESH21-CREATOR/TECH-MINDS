const db = require("../config/db");
const authService = require("../services/authService");

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/signup
   */
  async signup(req, res) {
    try {
      const {
        name,
        email,
        password,
        role = "Student",
        institutionName,
        institutionCode,
        registerNumber,
        programme,
        organizationName,
        walletAddress
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: "Full name, email, and password are required."
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long."
        });
      }

      const existingUser = db.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "An account with this email address already exists. Please sign in."
        });
      }

      const validRoles = ["Student", "Institution", "Verifier"];
      const userRole = validRoles.includes(role) ? role : "Student";

      const passwordHash = await authService.hashPassword(password);

      const newUser = db.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: userRole,
        institutionName: institutionName || (userRole === "Institution" ? "CredentialChain Partner Institution" : undefined),
        institutionCode: institutionCode || (userRole === "Institution" ? "INST-2026" : undefined),
        registerNumber: registerNumber || (userRole === "Student" ? "REG-2026" : undefined),
        programme: programme || (userRole === "Student" ? "B.Tech Computer Science" : undefined),
        organizationName: organizationName || (userRole === "Verifier" ? "Independent Verification Agency" : undefined),
        walletAddress: walletAddress || null,
        isDemo: false
      });

      const token = authService.generateToken(newUser);
      const safeUser = authService.sanitizeUser(newUser);

      db.addAuditLog("USER_SIGNUP", { userId: newUser.id, email: newUser.email, role: newUser.role });

      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        token,
        user: safeUser
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to create account."
      });
    }
  }

  /**
   * Sign in an existing user
   * POST /api/auth/signin
   */
  async signin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required."
        });
      }

      const user = db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password. Please try again."
        });
      }

      const isMatch = await authService.comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password. Please try again."
        });
      }

      const token = authService.generateToken(user);
      const safeUser = authService.sanitizeUser(user);

      db.addAuditLog("USER_SIGNIN", { userId: user.id, email: user.email, role: user.role });

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: safeUser
      });
    } catch (err) {
      console.error("Signin error:", err);
      return res.status(500).json({
        success: false,
        error: "Authentication failed. Please try again."
      });
    }
  }

  /**
   * 1-Click Demo Login for Hackathon Panel
   * POST /api/auth/demo-login
   */
  async demoLogin(req, res) {
    try {
      const { role = "Student" } = req.body;
      const demoEmailMap = {
        Student: "student@credentialchain.demo",
        Institution: "institution@credentialchain.demo",
        Verifier: "verifier@credentialchain.demo"
      };

      const targetEmail = demoEmailMap[role] || "student@credentialchain.demo";
      const user = db.findUserByEmail(targetEmail);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `Demo account for role "${role}" could not be loaded.`
        });
      }

      const token = authService.generateToken(user);
      const safeUser = authService.sanitizeUser(user);

      db.addAuditLog("DEMO_LOGIN", { userId: user.id, role: user.role });

      return res.json({
        success: true,
        message: `Logged in as Demo ${user.role} (${user.name})`,
        token,
        user: safeUser
      });
    } catch (err) {
      console.error("Demo login error:", err);
      return res.status(500).json({
        success: false,
        error: "Demo login failed."
      });
    }
  }

  /**
   * Get currently authenticated user profile
   * GET /api/auth/me
   */
  async getMe(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "Authorization header missing or malformed."
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = authService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: "Session expired or invalid. Please sign in again."
        });
      }

      const user = db.findUserById(decoded.id) || db.findUserByEmail(decoded.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User record not found."
        });
      }

      return res.json({
        success: true,
        user: authService.sanitizeUser(user)
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to load user profile."
      });
    }
  }
}

module.exports = new AuthController();
