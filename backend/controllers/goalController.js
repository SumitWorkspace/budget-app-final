const Goal = require("../models/Goal");

const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
        res.status(200).json(goals);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

const createGoal = async (req, res) => {
    try {
        const { title, targetAmount, deadline, color } = req.body;
        if (!title || !targetAmount || !deadline) {
            return res.status(400).json({ message: "Title, target amount, and deadline are required." });
        }

        const goal = await Goal.create({
            user: req.user.id,
            title,
            targetAmount,
            deadline,
            color
        });

        res.status(201).json(goal);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentAmount } = req.body; // Can also update other fields

        const goal = await Goal.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true }
        );

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        res.status(200).json(goal);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOneAndDelete({ _id: id, user: req.user.id });
        
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        
        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
