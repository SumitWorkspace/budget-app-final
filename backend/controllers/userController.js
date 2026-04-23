const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ================= REGISTER =================
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // ✅ STRICT VALIDATION
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (typeof password !== "string" || password.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 🔐 HASH PASSWORD (SAFE)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔥 SAVE USER
        const user = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            phone
        });

        console.log("✅ USER SAVED:", user.email);

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("❌ REGISTER ERROR:", error.message);
        res.status(500).json({ message: error.message });
    }
};


// ================= LOGIN =================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔥 CRITICAL CHECK
        if (!user.password || user.password.length < 20) {
            return res.status(400).json({
                message: "Account corrupted. Please register again."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("❌ LOGIN ERROR:", error.message);
        res.status(500).json({ message: error.message });
    }
};


// ================= GOOGLE AUTH =================
exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email.toLowerCase();
        const name = payload.name;

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name,
                email,
                password: hashedPassword
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error("❌ Google Auth Error:", error.message);
        res.status(500).json({ message: "Google Authentication failed" });
    }
};


// ================= PROFILE =================
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= UPDATE PROFILE =================
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= SETTINGS =================
exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.settings = { ...user.settings.toObject(), ...req.body.settings };

        await user.save();

        res.json({ message: "Settings updated", settings: user.settings });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim();

        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: `Reset your password:\n${resetUrl}`
        });

        res.json({ message: 'Email sent' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};