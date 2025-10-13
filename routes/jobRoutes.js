const express = require('express');
const axios = require('axios');
const Job = require('../models/Job');
const { protect, recruiterOnly } = require('../middleware/auth');
const router = express.Router();

// FETCH JOBS FROM JSEARCH API
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

// RECRUITER POSTS A JOB
router.post('/', protect, recruiterOnly, async (req, res) => {
  try {
    const job = new Job({ ...req.body, postedBy: req.user._id, source: 'Recruiter' });
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// GET ALL JOBS
router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ postedAt: -1 }).populate('postedBy', 'name email');
  res.json(jobs);
});

module.exports = router;
