const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // --- Naya Settings Field ---
    settings: {
        theme: { 
            type: String, 
            default: 'light',
            enum: ['light', 'dark'] // Taaki koi random value na daal sake
        },
        currency: { 
            type: String, 
            default: 'INR' 
        },
        notifications: { 
            type: Boolean, 
            default: true 
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);