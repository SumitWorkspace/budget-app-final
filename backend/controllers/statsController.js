const Transaction = require("../models/Transaction"); // require use karo

const getStats = async (req, res) => {
    try {
        const userId = req.user.id; 

        const stats = await Transaction.aggregate([
            { $match: { user: new require('mongoose').Types.ObjectId(userId) } }, // ObjectId fix
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || { totalIncome: 0, totalExpense: 0 };
        res.status(200).json({
            totalIncome: result.totalIncome,
            totalExpense: result.totalExpense,
            balance: result.totalIncome - result.totalExpense
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export ka sahi tareeka require ke liye
module.exports = { getStats };