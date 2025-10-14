const RecruiterJob = require("../models/RecruiterJob");

exports.createJob = async (req, res) => {
  try {
    const job = await RecruiterJob.create({
      recruiterId: req.user.id,
      ...req.body,
    });
    res.json({ message: "Job posted successfully", job });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await RecruiterJob.find({ recruiterId: req.user.id });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: "Failed to get recruiter jobs" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await RecruiterJob.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ message: "Job updated", job });
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await RecruiterJob.findOneAndDelete({
      _id: req.params.id,
      recruiterId: req.user.id,
    });
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};
