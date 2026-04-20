const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    color: {
        type: String,
        default: "#10b981" // Default emerald
    }
}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);
