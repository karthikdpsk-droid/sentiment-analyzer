const express = require("express");
const router = express.Router();
const {
  analyzeText,
  getHistory,
  deleteAnalysis,
  clearHistory
} = require("../controllers/sentiment.controller");

// Analyze text
router.post("/analyze", analyzeText);

// Get all history
router.get("/history", getHistory);

// Delete single analysis
router.delete("/history/:id", deleteAnalysis);

// Clear all history
router.delete("/history", clearHistory);

module.exports = router;
