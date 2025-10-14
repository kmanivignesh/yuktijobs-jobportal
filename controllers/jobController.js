const Job = require('../models/Job');
const Application = require('../models/Application');

// 🟢 Recruiter creates a job
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, salary, skills, applyLink } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      salary,
      skills,
      applyLink,
      postedBy: req.user._id, // recruiter
      source: 'Recruiter',
      postedAt: new Date(),
    });

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: 'Error posting job', error: err.message });
  }
};

// 🟡 Jobseeker applies for a job
exports.applyJob = async (req, res) => {
  try {
    const { jobId, skills, cvLink } = req.body;
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const app = await Application.create({
      job: jobId,
      applicant: req.user._id,
      skills,
      cvLink,
    });

    res.json({ message: 'Applied successfully', application: app });
  } catch (err) {
    console.error('Error applying to job:', err);
    res.status(500).json({ message: 'Error applying to job' });
  }
};

// 🔵 Recruiter updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body; // accepted/rejected

    const app = await Application.findById(appId).populate('job');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (app.job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    app.status = status;
    await app.save();

    res.json({ message: 'Status updated successfully', application: app });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

// 🔴 Recruiter job analytics
exports.getJobAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const analytics = await Promise.all(
      jobs.map(async (job) => {
        const total = await Application.countDocuments({ job: job._id });
        const accepted = await Application.countDocuments({ job: job._id, status: 'accepted' });
        const rejected = await Application.countDocuments({ job: job._id, status: 'rejected' });

        return {
          title: job.title,
          totalApplications: total,
          accepted,
          rejected,
        };
      })
    );
    res.json({ analytics });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

// 🟣 Get all jobs (for Jobseekers)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 }).populate('postedBy', 'name email role');
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

// 🟤 Recruiter: Get own jobs + analytics
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ postedAt: -1 });

    const analytics = await Promise.all(
      jobs.map(async (job) => {
        const total = await Application.countDocuments({ job: job._id });
        const accepted = await Application.countDocuments({ job: job._id, status: 'accepted' });
        const rejected = await Application.countDocuments({ job: job._id, status: 'rejected' });
        const pending = total - accepted - rejected;

        return {
          jobId: job._id,
          title: job.title,
          total,
          accepted,
          rejected,
          pending: pending > 0 ? pending : 0
        };
      })
    );

    res.json({ jobs, analytics });
  } catch (err) {
    console.error('Error fetching recruiter jobs:', err);
    res.status(500).json({ message: 'Error fetching recruiter jobs' });
  }
};
