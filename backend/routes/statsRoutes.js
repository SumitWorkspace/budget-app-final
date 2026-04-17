const express = require('express');
const router = express.Router();

// Controllers import kar rahe hain
const { getStats } = require('../controllers/statsController');
const { getInsights } = require('../controllers/insightsController');
// Note: Agar chartController abhi nahi banaya toh niche wali line ko comment kar dena
const { getChartData } = require('../controllers/chartController'); 

// Middleware import (taaki sirf logged-in user hi apna data dekh sake)
const { protect } = require('../middleware/authMiddleware');

// --- Routes Configuration ---

// 1. Dashboard Stats (Balance, Total Income, Total Expense)
// URL: GET /api/stats
router.get('/', protect, getStats);

// 2. Smart Insights (Overspending alert, Savings rate, Message)
// URL: GET /api/stats/insights
router.get('/insights', protect, getInsights);

// 3. Analytics Charts (Monthly breakdown for Graphs)
// URL: GET /api/stats/charts
router.get('/charts', protect, getChartData);

module.exports = router;