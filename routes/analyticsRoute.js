const express = require('express');
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');

const router = express.Router();

// Jobseeker analytics
router.get('/jobseeker/stats', protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id });
    
    const stats = {
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