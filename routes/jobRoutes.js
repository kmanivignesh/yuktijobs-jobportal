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
const router = express.Router();

// -------------------------------
// 1️⃣ FETCH JOBS FROM EXTERNAL API
// -------------------------------
router.get('/fetch', async (req, res) => {
  const query = req.query.search || 'python developer in India';
  const url = 'https://jsearch.p.rapidapi.com/search';
  const headers = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
  };
  const params = { query, page: '1', num_pages: '1' };

  try {
    const response = await axios.get(url, { headers, params });
    const jobs = response.data.data || [];

    const jobDocs = jobs.map(job => ({
      employer: job.employer_name || 'Unknown',
      title: job.job_title || 'No title',
      location: job.job_city || job.job_country || 'Remote',
      postedAt: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc)
        : new Date(),
      description: job.job_description || '',
      applyLink: job.job_apply_link || '',
      source: 'JSearch',
    }));

    await Job.deleteMany({ source: 'JSearch' });
    await Job.insertMany(jobDocs);

    res.json({ message: 'Jobs fetched and saved', count: jobDocs.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// -------------------------------
// 2️⃣ RECRUITER: POST JOB
// -------------------------------
router.post('/', protect, recruiterOnly, createJob);

// -------------------------------
// 3️⃣ JOB SEEKER: APPLY JOB
// -------------------------------
router.post('/:jobId/apply', protect, applyJob);

// -------------------------------
// 4️⃣ RECRUITER: UPDATE APPLICATION STATUS
// -------------------------------
router.put('/application/:appId/status', protect, recruiterOnly, updateApplicationStatus);

// -------------------------------
// 5️⃣ RECRUITER: VIEW ANALYTICS
// -------------------------------
router.get('/analytics', protect, recruiterOnly, getJobAnalytics);

// -------------------------------
// 6️⃣ RECRUITER: MY JOBS + APPLICATION COUNTS
// -------------------------------
router.get('/my-jobs', protect, recruiterOnly, getMyJobs);


// -------------------------------
// 7️⃣ JOB SEEKER: VIEW ALL JOBS
// -------------------------------
router.get('/', getAllJobs);

router.put('/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    Object.assign(job, req.body); // update fields
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a job
router.delete('/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
