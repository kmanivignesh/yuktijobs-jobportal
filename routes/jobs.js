const express = require('express');
const axios = require('axios');
const Job = require('../models/Job');
const router = express.Router();

// Fetch jobs from JSearch and save to MongoDB
router.get('/fetch', async (req, res) => {
  const query = req.query.search || 'python developer in India';
  const url = 'https://jsearch.p.rapidapi.com/search';
  const headers = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Make sure your .env has this key
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
  };
  const params = { query, page: '1', num_pages: '1' };

  try {
    const response = await axios.get(url, { headers, params });
    const jobs = response.data.data || [];

    if (jobs.length === 0) {
      return res.json({ message: 'No jobs found', count: 0 });
    }

    // Map jobs to MongoDB schema
    const jobDocs = jobs.map(job => ({
      employer: job.employer_name || 'Unknown',
      title: job.job_title || 'No title',
      location: job.job_city || job.job_country || 'Remote',
      postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
      description: job.job_description || '',
      applyLink: job.job_apply_link || '',
      source: 'JSearch',
    }));

    // Clear previous search jobs
    await Job.deleteMany({ source: 'JSearch' });

    // Insert new jobs
    await Job.insertMany(jobDocs);

    res.json({ message: 'Jobs fetched and saved', count: jobDocs.length });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get all jobs from MongoDB
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 }); // latest jobs first
    res.json(jobs);
  } catch (error) {
    console.error('Error retrieving jobs:', error.message);
    res.status(500).json({ error: 'Failed to retrieve jobs' });
  }
});

module.exports = router;
