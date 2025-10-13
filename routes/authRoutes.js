const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// =============== SIGNUP ==================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create new user (no hashing)
    const newUser = new User({
      name,
      email,
      password,  // store as plain text (not hashed)
      role,
      otp,
      isVerified: false,
    });
    await newUser.save();

    // Send OTP email
    await sendEmail(email, 'Your YuktiJobs OTP', `Your OTP for account verification is: ${otp}`);

    res.json({ message: 'Signup successful. OTP sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// =============== VERIFY OTP ==================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    if (user.otp == parseInt(otp)) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      res.json({ message: 'Account verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

// =============== LOGIN ==================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your account first' });

    // Plain text password check
    if (user.password != password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
