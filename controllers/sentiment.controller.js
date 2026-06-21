const Sentiment = require("sentiment");
const Analysis = require("../models/analysis.model");

const sentiment = new Sentiment();

// Analyze text
const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    // Analyze sentiment
    const result = sentiment.analyze(text);
    const score = result.score;

    // Determine sentiment
    let sentimentLabel, emoji;
    if (score > 0) {
      sentimentLabel = "Positive";
      emoji = "😊";
    } else if (score < 0) {
      sentimentLabel = "Negative";
      emoji = "😢";
    } else {
      sentimentLabel = "Neutral";
      emoji = "😐";
    }

    // Calculate percentage
    const maxScore = Math.max(Math.abs(score) * 10, 1);
    const percentage = Math.min(Math.round((Math.abs(score) / maxScore) * 100 + 50), 99) + "%";

    // Save to MongoDB
    const analysis = await Analysis.create({
      text,
      sentiment: sentimentLabel,
      score,
      percentage,
      emoji
    });

    res.json({
      success: true,
      message: "Sentiment analyzed successfully",
      data: {
        id: analysis._id,
        text,
        sentiment: sentimentLabel,
        score,
        percentage,
        emoji,
        createdAt: analysis.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Analysis failed",
      error: error.message
    });
  }
};

// Get all history
const getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      total: analyses.length,
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get history",
      error: error.message
    });
  }
};

// Delete single analysis
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found"
      });
    }
    res.json({
      success: true,
      message: "Analysis deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete analysis",
      error: error.message
    });
  }
};

// Clear all history
const clearHistory = async (req, res) => {
  try {
    await Analysis.deleteMany({});
    res.json({
      success: true,
      message: "History cleared successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear history",
      error: error.message
    });
  }
};

module.exports = { analyzeText, getHistory, deleteAnalysis, clearHistory };
