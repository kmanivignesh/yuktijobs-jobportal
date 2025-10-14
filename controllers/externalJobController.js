const axios = require("axios");
const ExternalJob = require("../models/ExternalJob");

exports.fetchExternalJobs = async (req, res) => {
  const { query = "Python Developer in India" } = req.query;

  try {
    const options = {
      method: "GET",
      url: "https://jsearch.p.rapidapi.com/search",
      params: { query, page: "1", num_pages: "1" },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    const jobs = response.data.data.map((job) => ({
      Employer: job.employer_name,
      Title: job.job_title,
      Location: job.job_country,
      Posted_At: job.job_posted_at_datetime_utc,
      Description: job.job_description,
      Apply_Link: job.job_apply_link,
    }));

    await ExternalJob.deleteMany({});
    await ExternalJob.insertMany(jobs);

    res.json({ message: "External jobs updated successfully", count: jobs.length });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch external jobs" });
  }
};

exports.getExternalJobs = async (req, res) => {
  try {
    const jobs = await ExternalJob.find().limit(20);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get external jobs" });
  }
};
