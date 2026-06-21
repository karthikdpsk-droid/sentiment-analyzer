const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    required: true,
    enum: ["Positive", "Negative", "Neutral"]
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Analysis", analysisSchema);
