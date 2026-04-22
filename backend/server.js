const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
console.log("MONGO_URI:", process.env.MONGO_URI);

// 🔥 ADD THESE 2 LINES
const http = require("http");
const { Server } = require("socket.io");

// Import Routes
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();

// 🔥 ADD THIS (create server + socket)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// 🔥 MAKE SOCKET AVAILABLE EVERYWHERE
app.set("io", io);

// --- 1. Middlewares ---
app.use(express.json()); 
app.use(cors()); 

// --- 2. Routes ---
app.use('/api/users', userRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/stats', statsRoutes); 
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);

// ✅ WhatsApp webhook
app.use('/webhook', whatsappRoutes);

// --- 3. Database Connection & Server Start ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // 🔥 CHANGE THIS LINE (use server instead of app)
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('✅ MongoDB Connected Successfully');
        });
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

app.use(errorHandler);