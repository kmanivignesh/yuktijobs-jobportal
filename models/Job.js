const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  employer: String,
  description: String,
  location: String,
  postedAt: { type: Date, default: Date.now },
  applyLink: String,
  source: { type: String, default: 'Recruiter' }, // 'Recruiter' or 'JSearch'
  salary: String,
  skills: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
