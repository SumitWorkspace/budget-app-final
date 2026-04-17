const Transaction = require("../models/Transaction");
const mongoose = require('mongoose');

const getChartData = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const chartData = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: { 
                        month: { $month: "$date" }, 
                        type: "$type" 
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        res.status(200).json(chartData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChartData };