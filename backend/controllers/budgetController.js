const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// Get all budgets for a specific month (format: YYYY-MM) with amount spent
const getBudgets = async (req, res) => {
    try {
        const { month } = req.query; // '2023-10'
        if (!month) return res.status(400).json({ message: "Month is required (YYYY-MM)" });

        const userId = req.user.id;

        // Fetch user's budgets for the month
        const budgets = await Budget.find({ user: userId, month }).lean();

        // Calculate start and end date for the month
        const [year, m] = month.split('-');
        const startDate = new Date(year, m - 1, 1);
        const endDate = new Date(year, m, 1);

        // Aggregate expenses for that month by category
        const expenses = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    type: "expense",
                    date: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: "$category",
                    spent: { $sum: "$amount" }
                }
            }
        ]);

        // Map spent amounts to budgets
        const expenseMap = {};
        expenses.forEach(e => {
            expenseMap[e._id] = e.spent;
        });

        const enhancedBudgets = budgets.map(b => ({
            ...b,
            spent: expenseMap[b.category] || 0
        }));

        res.status(200).json(enhancedBudgets);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Create or update a budget for a category/month
const createOrUpdateBudget = async (req, res) => {
    try {
        const { category, limit, month } = req.body;
        if (!category || !limit || !month) {
            return res.status(400).json({ message: "Please provide category, limit, and month." });
        }

        const userId = req.user.id;

        const budget = await Budget.findOneAndUpdate(
            { user: userId, category, month },
            { limit },
            { new: true, upsert: true }
        );

        res.status(200).json(budget);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Delete a budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findOneAndDelete({ _id: id, user: req.user.id });
        
        if (!budget) return res.status(404).json({ message: "Budget not found" });
        
        res.status(200).json({ message: "Budget deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget };
