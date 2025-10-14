require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/external-jobs", require("./routes/externalJobRoutes"));
app.use("/api/recruiter-jobs", require("./routes/recruiterJobRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoute"));
app.use('/api/profile', profileRoutes);


// MongoDB connect
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Default route
app.get("/", (req, res) => res.send("API running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
