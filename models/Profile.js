const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String,
  email: String,
  phone: String,
  skills: [String],
  experience: String,
  education: String,
  resumeLink: String
});

export default mongoose.model('Profile', profileSchema);
