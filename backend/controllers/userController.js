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
