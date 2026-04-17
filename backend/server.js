const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Routes
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes'); // 1. Naya Import yahan dalo

const app = express();

// --- 1. Middlewares ---
app.use(express.json()); 
app.use(cors()); 

// --- 2. Routes ---
app.use('/api/users', userRoutes);
app.use('/api/v1', transactionRoutes);

// 2. Stats aur Insights ko register karo
app.use('/api/stats', statsRoutes); 

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
        process.exit(1);
    });
    const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);