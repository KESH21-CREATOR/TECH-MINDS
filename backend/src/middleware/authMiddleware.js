const authService = require("../services/authService");
const db = require("../config/db");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please sign in to access your records."
    });
  }

  const token = authHeader.split(" ")[1];
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: "Your session has expired or is invalid. Please sign in again."
    });
  }

  const user = db.findUserById(decoded.id) || db.findUserByEmail(decoded.email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "User account not found. Please register or sign in."
    });
  }

  req.user = authService.sanitizeUser(user);
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = authService.verifyToken(token);
    if (decoded) {
      const user = db.findUserById(decoded.id) || db.findUserByEmail(decoded.email);
      if (user) {
        req.user = authService.sanitizeUser(user);
      }
    }
  }
  next();
}

module.exports = { authenticateToken, optionalAuth };
