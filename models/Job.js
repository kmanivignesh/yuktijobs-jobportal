const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  salary: String,
  skills: [String],
  applyLink: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // important
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
