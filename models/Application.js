const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobseekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeLink: { type: String },
  status: { type: String, enum: ['Applied', 'Reviewed', 'Selected', 'Rejected'], default: 'Applied' },
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', applicationSchema);
