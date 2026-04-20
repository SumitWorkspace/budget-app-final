const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: Number,
        required: true
    },
    month: {
        type: String, // Format: 'YYYY-MM'
        required: true
    }
}, { timestamps: true });

// A user can only have one budget per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
