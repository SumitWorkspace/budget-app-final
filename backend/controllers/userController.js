const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// 📝 SIGNUP LOGIC
exports.registerUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = req.body.email.trim().toLowerCase();

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Hash the password (Security)
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔑 LOGIN LOGIC
exports.loginUser = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email.trim();

        // Find User case-insensitively
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        // Check Password
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (!user.password) {
            return res.status(400).json({ 
                message: "This account was created using Google Sign-In. Please use the 'Sign in with Google' button." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // Create JWT Token (The "ID Card" for the frontend)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🌐 GOOGLE AUTH LOGIC
exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        
        if (!user) {
            // Generate a random highly secure password for google users
            const generatedPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);
            
            // Create the new user
            user = await User.create({
                name,
                email,
                password: hashedPassword
            });
        }
        
        // Create JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Google Authentication failed", error: error.message });
    }
};

// 👤 GET USER PROFILE (Get details of logged-in user)
exports.getUserProfile = async (req, res) => {
    try {
        // req.user.id humein 'protect' middleware se milta hai
        const user = await User.findById(req.user.id).select("-password"); // Password hide kar do
        
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⚙️ UPDATE USER PROFILE (Change name or email)
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Agar body mein naya naam/email hai toh badlo, warna purana hi rakho
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Agar user password badalna chahta hai
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                // Dashboard update ke liye naya user object bhej rahe hain
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ⚙️ UPDATE USER SETTINGS
exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Sirf wahi settings update karo jo body mein aayi hain
        // Spread operator use kiya hai taaki baaki settings delete na ho jayein
        user.settings = { ...user.settings.toObject(), ...req.body.settings };
        
        await user.save();
        res.json({ message: "Settings updated", settings: user.settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📨 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email.trim();
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });

        if (!user) {
            return res.status(404).json({ message: "No user found with that email" });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and save to database
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset URL (This points to the React frontend)
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'SmartBudget Password Reset Token',
                message
            });

            res.status(200).json({ message: 'Email sent successfully. Please check your console or inbox.' });
        } catch (error) {
            console.error(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔄 RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        if (!req.body.password) {
            return res.status(400).json({ message: "New password is required" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
