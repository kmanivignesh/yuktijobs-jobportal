const Job = require('../models/Job');
const User = require('../models/User');

// Create a job
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, salary, skills, location } = req.body;
    const job = await Job.create({
      title,
      company,
      description,
      salary,
      skills,
      location,
      recruiter: req.user._id,
    });
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Job creation failed', error: err.message });
  }
};

// Get all jobs (public)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isOpen: true }).populate('recruiter', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
};

// Apply for job
exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.applicants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applicants.push(req.user._id);
    await job.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error applying', error: err.message });
  }
};

// Recruiter: View applicants
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('applicants', 'name email profile');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job.applicants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applicants', error: err.message });
  }
};
