const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/search', protect, searchUsers);
router.get('/:id', getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
