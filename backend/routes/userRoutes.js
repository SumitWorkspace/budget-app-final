const express = require('express');
const router = express.Router();

// Controllers se functions import karo
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    updateSettings // 👈 Ye naya function add kiya
} = require('../controllers/userController');

// Middleware import
const { protect } = require('../middleware/authMiddleware');

// --- Routes ---

// 1. Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 2. Private Routes (Token zaroori hai)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// 3. Settings Route (Bhavishya ke analytics aur UI preferences ke liye)
router.put('/settings', protect, updateSettings); 

module.exports = router;