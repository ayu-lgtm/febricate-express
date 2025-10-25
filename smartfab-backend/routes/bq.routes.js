// 📁 routes/bq.routes.js
const express = require("express");
const {
  handleGetCityCodes,
  handleGetRawMaterials,
  handleGetFGMaterials,
  handleCheckFreight,
} = require("../controllers/bqController");

const router = express.Router();

// 🔹 BQ Routes
router.get("/city-codes", handleGetCityCodes);
router.get("/raw-materials", handleGetRawMaterials);
router.get("/fg-materials", handleGetFGMaterials);
router.post("/check-freight", handleCheckFreight);

module.exports = router;