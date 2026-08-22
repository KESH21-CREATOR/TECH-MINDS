const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Sign Up
router.post("/signup", (req, res) => authController.signup(req, res));

// Sign In
router.post("/signin", (req, res) => authController.signin(req, res));

// 1-Click Demo Login
router.post("/demo-login", (req, res) => authController.demoLogin(req, res));

// Get Current User Profile
router.get("/me", (req, res) => authController.getMe(req, res));

// Update Profile
router.put("/profile", (req, res) => authController.updateProfile(req, res));

module.exports = router;
