const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR" 
    }, // <--- Yahan comma missing tha
    type: {
        type: String,
        enum: ["expense", "income"], 
        default: "expense"
    },
    date: {
        type: Date,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 100,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    }
}, {timestamps: true});

module.exports = mongoose.model('Transaction', TransactionSchema);