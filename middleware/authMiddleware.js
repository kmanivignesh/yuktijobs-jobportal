// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// // Configure nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or any SMTP
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ------------------- Signup -------------------
// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: 'Email already registered' });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Save user with OTP
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       otp,
//       otpExpires: Date.now() + 10 * 60 * 1000, // 10 mins
//     });

//     // Send OTP email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Verify your email OTP',
//       text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
//     });

//     res.status(201).json({ message: 'Signup successful! OTP sent to your email.' });

//   } catch (err) {
//     console.error('Signup error:', err.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // ------------------- Verify OTP -------------------
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

//     if (user.otp !== parseInt(otp)) return res.status(400).json({ message: 'Invalid OTP' });

//     if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpires = null;
//     await user.save();

//     res.json({ message: 'Email verified successfully!' });

//   } catch (err) {
//     console.error('OTP verification error:', err.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // ------------------- Login -------------------
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({ message: 'Login successful', token, role: user.role });

//   } catch (err) {
//     console.error('Login error:', err.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


