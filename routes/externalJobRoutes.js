const express = require("express");
const router = express.Router();
const { fetchExternalJobs, getExternalJobs } = require("../controllers/externalJobController");

router.get("/fetch", fetchExternalJobs);
router.get("/", getExternalJobs);

module.exports = router;
