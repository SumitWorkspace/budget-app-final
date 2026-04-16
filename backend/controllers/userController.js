const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 📝 SIGNUP LOGIC
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Hash the password (Security)
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
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        // Check Password
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