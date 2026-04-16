const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Routes
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes'); // New: For Login/Signup

const app = express();

// --- 1. Middlewares ---
app.use(express.json()); 
app.use(cors()); 

// --- 2. Routes ---
// User Auth Routes (Signup/Login)
app.use('/api/users', userRoutes);

// Transaction Routes (Expenses/Income)
app.use('/api/v1', transactionRoutes);

// --- 3. Database Connection & Server Start ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('✅ MongoDB Connected Successfully');
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Stop server if DB connection fails
    });