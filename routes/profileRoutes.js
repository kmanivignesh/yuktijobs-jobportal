const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, upsertProfile } = require('../controllers/profileController');

router.get('/', authMiddleware, getProfile);
router.post('/', authMiddleware, upsertProfile); // create or update

module.exports = router;
