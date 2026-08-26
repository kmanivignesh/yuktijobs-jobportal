const mongoose = require("mongoose");

const recruiterJobSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  description: String,
  location: String,
  salary: String,
  skills: [String],
  applyLink: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RecruiterJob", recruiterJobSchema);
