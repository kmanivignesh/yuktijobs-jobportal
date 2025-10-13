const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // simple file upload

// GET my profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// UPDATE profile
router.put('/me', protect, upload.single('cv'), async (req, res) => {
  try {
    const { skills } = req.body;
    const updateData = { skills: skills ? skills.split(',').map(s => s.trim()) : [] };
    if (req.file) updateData.cv = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
