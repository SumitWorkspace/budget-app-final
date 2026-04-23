const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ================= REGISTER =================
exports.registerUser = async (req, res) => {
    console.log("Registration attempt:", req.body);
    try {
        const { name, email, password, phone } = req.body;

        // ✅ STRICT VALIDATION
        if (!name || !email || !password || !phone) {
            console.log("Registration failed: Missing fields", { name: !!name, email: !!email, password: !!password, phone: !!phone });
            return res.status(400).json({ message: "All fields are required" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 🔥 SAFETY CHECK
        if (typeof password !== "string" || password.length < 4) {
            return res.status(400).json({ message: "Invalid password (min 4 characters)" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            phone
        });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("REGISTER ERROR:", error.message);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
        }
        res.status(500).json({ message: error.message });
    }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
    console.log("Login attempt:", req.body.email);
    try {
        const { email, password } = req.body;

        // ✅ VALIDATION
        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }

        const cleanEmail = email.trim().toLowerCase();

        // 🔍 IMPORTANT: We need to use .select("+password") because the field is hidden by default in the model
        const user = await User.findOne({ email: cleanEmail }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔥 FIX: HANDLE USERS WITHOUT PASSWORD (e.g. Google Sign-In users)
        if (!user.password) {
            return res.status(400).json({
                message: "This account was created using Google Sign-In. Please use the 'Sign in with Google' button."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔐 JWT
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

    } catch (err) {
        console.error("❌ LOGIN ERROR:", err.message);
        res.status(500).json({ message: err.message });
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
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // 🔥 generate password for consistency
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                phone: `google_${Date.now()}` // Temporary unique phone for google users if required
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
        console.error("Google Auth Error:", error);
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
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
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

        const message = `Reset your password:\n${resetUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message
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

        if (!req.body.password) {
            return res.status(400).json({ message: "New password is required" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};