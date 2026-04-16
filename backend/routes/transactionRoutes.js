const express = require('express');
const router = express.Router();

// 1. Controllers import karo
const { addTransaction, getTransactions, deleteTransaction, getStats } = require('../controllers/transactionController');

// 2. Middleware import karna mat bhoolna!
const { protect } = require('../middleware/authMiddleware');

// 3. Har route ke beech mein 'protect' lagao taaki User ID mil sake
router.post('/add-transaction', protect, addTransaction);
router.get('/get-transactions', protect, getTransactions);
router.get('/get-stats', protect, getStats);
router.delete('/delete-transaction/:id', protect, deleteTransaction);

module.exports = router;