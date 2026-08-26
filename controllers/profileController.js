const Profile = require('../models/Profile');

// Get profile of logged-in user
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Create or update profile
exports.upsertProfile = async (req, res) => {
  try {
    const { fullName, email, phone, skills, experience, education, resumeLink } = req.body;

    const profileData = {
      userId: req.user.id,
      fullName,
      email,
      phone,
      skills: skills?.split(',').map(s => s.trim()), // comma-separated string -> array
      experience,
      education,
      resumeLink
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { new: true, upsert: true } // create if doesn't exist
    );

    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
