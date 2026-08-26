const express = require('express');
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');

const router = express.Router();

// 🟢 Get user's applications
router.get('/my-applications', protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title employer location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// 🟢 Get applications for a specific job (recruiter)
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Error fetching job applications:', err);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Add to routes/applicationRoute.js
router.get('/recruiter/stats', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const applications = await Application.find({ 
      job: { $in: jobs.map(j => j._id) } 
    });
    
    const stats = {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      pending: applications.filter(app => app.status === 'pending').length
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;