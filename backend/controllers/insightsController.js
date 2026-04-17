const Transaction = require("../models/Transaction");

const getInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjId = new require('mongoose').Types.ObjectId(userId);

        const categoryData = await Transaction.aggregate([
            { $match: { user: userObjId, type: "expense" } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ]);

        const totals = await Transaction.aggregate([
            { $match: { user: userObjId } },
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
        ]);

        const income = totals.find(t => t._id === "income")?.total || 0;
        const expense = totals.find(t => t._id === "expense")?.total || 0;

        let message = "Your finances look stable!";
        if (expense > income) message = "Warning: You are spending more than you earn!";
        else if (expense > income * 0.8) message = "High Alert: You've spent 80% of your income.";

        res.status(200).json({
            highestCategory: categoryData[0]?._id || "None",
            savingsRate: income > 0 ? (((income - expense) / income) * 100).toFixed(2) : 0,
            message,
            breakdown: categoryData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInsights };