const TransactionSchema = require("../models/Transaction");

// 1. Add Transaction (Smart & User-Linked)
exports.addTransaction = async (req, res) => {
    // Currency ko bhi body se destructure kiya
    const { title, amount, category, description, date, type, currency } = req.body;

    try {
        if (!title || !category || !description || !date || !amount) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        const transaction = new TransactionSchema({
            title,
            amount,
            category,
            description,
            date,
            type,
            currency: currency || "INR", // Default INR agar user ne kuch nahi bheja
            user: req.user.id 
        });

        await transaction.save();
        res.status(201).json({ message: 'Transaction Added Successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. Get User-Specific Transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await TransactionSchema.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Delete Transaction
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await TransactionSchema.findOneAndDelete({ _id: id, user: req.user.id });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }
        res.status(200).json({ message: 'Transaction Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. Get Smart Stats & Predictions (The "A+" Feature)
exports.getStats = async (req, res) => {
    try {
        const transactions = await TransactionSchema.find({ user: req.user.id });
        
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach((t) => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpenses += t.amount;
        });

        const totalBalance = totalIncome - totalExpenses;

        // --- SMART PREDICTION LOGIC ---
        const firstTx = await TransactionSchema.findOne({ user: req.user.id }).sort({ date: 1 });
        const today = new Date();
        const startDate = firstTx ? new Date(firstTx.date) : today;

        // Days active calculate karo
        const diffInMs = Math.abs(today - startDate);
        const daysActive = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));

        // Daily Avg Expense
        const dailyAvg = totalExpenses / daysActive;

        // Prediction logic
        let daysLeft = totalBalance > 0 && dailyAvg > 0 ? Math.floor(totalBalance / dailyAvg) : 0;

        res.status(200).json({
            totalBalance,
            totalIncome,
            totalExpenses,
            prediction: {
                dailyAverage: dailyAvg.toFixed(2),
                estimatedDaysRemaining: daysLeft > 365 ? "365+" : daysLeft,
                status: daysLeft < 7 ? "Critical: Low Balance" : "Stable"
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};