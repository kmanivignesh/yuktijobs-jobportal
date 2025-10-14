const express = require("express");
const RecruiterJob = require("../models/RecruiterJob"); // THIS MUST EXIST

const router = express.Router();
const {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
} = require("../controllers/recruiterJobController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createJob);
router.get("/my-jobs", authMiddleware, getMyJobs);
router.put("/update/:id", authMiddleware, updateJob);
router.delete("/delete/:id", authMiddleware, deleteJob);
// Public endpoint for jobseekers to fetch all jobs
router.get("/all", async (req, res) => {
  try {
    const jobs = await RecruiterJob.find()
      .populate({ path: "recruiterId", select: "name" }) // populate recruiter name
      .sort({ createdAt: -1 }); // latest first

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

module.exports = router;
