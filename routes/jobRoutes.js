const express = require('express');
const axios = require('axios');
const { protect, recruiterOnly } = require('../middleware/auth');
const {
  createJob,
  applyJob,
  updateApplicationStatus,
  getJobAnalytics,
  getAllJobs,
  getMyJobs
} = require('../controllers/jobController');

const Job = require('../models/Job');
const Application = require('../models/Application');
const router = express.Router();

// -------------------------------
// 1️⃣ GET ALL JOBS (FIXED - MOVED TO TOP)
// -------------------------------
router.get('/', getAllJobs);

// -------------------------------
// 2️⃣ FETCH JOBS FROM EXTERNAL API (FIXED)
// -------------------------------
router.get('/fetch', async (req, res) => {
  try {
    const query = req.query.search || 'developer in India';
    
    // Check if API key exists
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: 'RapidAPI key not configured',
        message: 'Please set RAPIDAPI_KEY in environment variables'
      });
    }

    const url = 'https://jsearch.p.rapidapi.com/search';
    const headers = {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    };
    const params = { 
      query, 
      page: '1', 
      num_pages: '1'
    };

    console.log('Fetching jobs from JSearch API...');
    
    const response = await axios.get(url, { 
      headers, 
      params,
      timeout: 10000
    });

    const jobs = response.data.data || [];
    
    console.log(`Received ${jobs.length} jobs from API`);

    if (jobs.length === 0) {
      return res.status(404).json({ 
        message: 'No jobs found for the given query',
        query 
      });
    }

    // Transform API data to match your schema
    const jobDocs = jobs.map(job => ({
      employer: job.employer_name || 'Unknown Company',
      title: job.job_title || 'No title',
      location: job.job_city || job.job_country || 'Remote',
      postedAt: job.job_posted_at_datetime_utc 
        ? new Date(job.job_posted_at_datetime_utc)
        : new Date(),
      description: job.job_description || 'No description available',
      applyLink: job.job_apply_link || '',
      source: 'JSearch',
    }));

    // Clear previous JSearch jobs and insert new ones
    await Job.deleteMany({ source: 'JSearch' });
    const savedJobs = await Job.insertMany(jobDocs);

    res.json({ 
      message: 'Jobs fetched and saved successfully', 
      count: savedJobs.length,
      jobs: savedJobs 
    });

  } catch (error) {
    console.error('JSearch API Error:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'External API error',
        message: error.response.data.message || 'Failed to fetch from job API'
      });
    } else if (error.request) {
      res.status(503).json({ 
        error: 'Network error',
        message: 'Could not connect to job search service'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

// -------------------------------
// 3️⃣ RECRUITER: POST JOB
// -------------------------------
router.post('/', protect, recruiterOnly, createJob);

// -------------------------------
// 4️⃣ JOB SEEKER: APPLY JOB
// -------------------------------
router.post('/:jobId/apply', protect, applyJob);

// -------------------------------
// 5️⃣ RECRUITER: UPDATE APPLICATION STATUS
// -------------------------------
router.put('/application/:appId/status', protect, recruiterOnly, updateApplicationStatus);

// -------------------------------
// 6️⃣ RECRUITER: VIEW ANALYTICS
// -------------------------------
router.get('/analytics', protect, recruiterOnly, getJobAnalytics);

// -------------------------------
// 7️⃣ RECRUITER: MY JOBS + APPLICATION COUNTS
// -------------------------------
router.get('/my-jobs', protect, recruiterOnly, getMyJobs);

// -------------------------------
// 8️⃣ RECRUITER: UPDATE JOB
// -------------------------------
router.put('/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    Object.assign(job, req.body);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------
// 9️⃣ RECRUITER: DELETE JOB
// -------------------------------
router.delete('/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------
// 🔟 DEBUG ROUTE (NEW - ADD THIS)
// -------------------------------
router.get('/debug', async (req, res) => {
  try {
    const jobCount = await Job.countDocuments();
    const localJobs = await Job.countDocuments({ source: 'Recruiter' });
    const externalJobs = await Job.countDocuments({ source: 'JSearch' });
    
    res.json({
      totalJobs: jobCount,
      localJobs,
      externalJobs,
      rapidApiKey: process.env.RAPIDAPI_KEY ? 'Set' : 'Missing'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;