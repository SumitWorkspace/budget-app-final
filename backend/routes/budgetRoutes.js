const express = require('express');
const router = express.Router();
const { getBudgets, createOrUpdateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBudgets);
router.post('/', protect, createOrUpdateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;
