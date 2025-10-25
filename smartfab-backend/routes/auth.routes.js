// 📁 routes/auth.routes.js
const express = require("express");
const { decryptAuth } = require("../controllers/auth.Controller");

const router = express.Router();

// 🔹 Auth Routes
router.post("/decrypt-auth", decryptAuth);

module.exports = router;