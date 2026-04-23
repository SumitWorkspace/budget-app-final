const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },

    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,   // ✅ FIX
        trim: true         // ✅ FIX
    },

    password: { 
        type: String, 
        required: true,
        select: false      // ✅ SECURITY FIX
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true         // ✅ FIX
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    settings: {
        theme: { 
            type: String, 
            default: 'light',
            enum: ['light', 'dark']
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

// ✅ optional performance indexes
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);