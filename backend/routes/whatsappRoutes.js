const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');

require('dotenv').config();

const VERIFY_TOKEN = "my_verify_token";

// 🔥 IMPORT MODELS
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ===============================
// ✅ VERIFY WEBHOOK (GET)
// ===============================
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("✅ Webhook Verified");
        return res.status(200).send(challenge);
    } else {
        console.log("❌ Verification Failed");
        return res.sendStatus(403);
    }
});

// ===============================
// 🚀 HANDLE INCOMING MESSAGES
// ===============================
router.post('/', async (req, res) => {
    console.log("🔥 WEBHOOK HIT");

    try {
        const body = req.body;

        console.log("📩 Incoming:", JSON.stringify(body, null, 2));

        // ✅ SAFE EXTRACTION
        const messageObj =
            body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        // ❌ Ignore non-message events (statuses etc.)
        if (!messageObj) {
            console.log("⚠️ Not a message event, skipping");
            return res.sendStatus(200);
        }

        const message = messageObj.text?.body;
        const phoneRaw = messageObj.from;

        if (!message || !phoneRaw) {
            console.log("⚠️ Missing message or phone");
            return res.sendStatus(200);
        }

        // ✅ Normalize phone
        const phone = phoneRaw.startsWith("91")
            ? phoneRaw
            : "91" + phoneRaw;

        console.log("📞 Phone:", phone);
        console.log("💬 Message:", message);

        // ===============================
        // 🔥 PARSE MESSAGE (FINAL FIXED)
        // ===============================
        let amount, category, type;
        const text = message.toLowerCase().trim();

        // 💸 EXPENSE
        if (text.startsWith("spent")) {
            const parts = text.split(" ");

            if (parts.length < 4) {
                await sendReply(phoneRaw, "❌ Format: Spent 200 on food");
                return res.sendStatus(200);
            }

            amount = parseInt(parts[1]);
            category = parts[3];
            type = "expense";
        }

        // 💰 INCOME
        else if (
            text.startsWith("received") ||
            text.startsWith("got") ||
            text.startsWith("earned")
        ) {
            const parts = text.split(" ");

            if (parts.length < 3) {
                await sendReply(phoneRaw, "❌ Format: Received 5000 salary");
                return res.sendStatus(200);
            }

            amount = parseInt(parts[1]);
            category = parts[2];
            type = "income";
        }

        // ❌ INVALID
        else {
            console.log("❌ Invalid format");

            await sendReply(
                phoneRaw,
                `❌ Invalid format!

📌 Use:
💸 Spent 200 on food
💰 Received 5000 salary`
            );

            return res.sendStatus(200);
        }

        // ❌ Safety check
        if (isNaN(amount)) {
            console.log("❌ Invalid amount");
            return res.sendStatus(200);
        }

        console.log("✅ Parsed:", amount, category, type);

        // ===============================
        // 💾 SAVE TO DATABASE
        // ===============================
        const user = await User.findOne({ phone });

        if (!user) {
            console.log("❌ No user found for phone:", phone);
            return res.sendStatus(200);
        }

        await Transaction.create({
            user: user._id,
            title: category,
            description: category,
            amount: amount,
            category: category,
            type: type,
            date: new Date()
        });

        console.log("💾 Transaction saved for user:", user._id);

        // ===============================
        // 📩 AUTO REPLY
        // ===============================
        await sendReply(
            phoneRaw,
            type === "expense"
                ? `₹${amount} spent on ${category} ✅`
                : `₹${amount} added as ${category} 💰`
        );

        res.sendStatus(200);

    } catch (err) {
        console.error("❌ Error:", err.message);
        res.sendStatus(200);
    }
});

// ===============================
// 📩 SEND WHATSAPP REPLY FUNCTION
// ===============================
async function sendReply(phone, message) {
    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: phone,
                text: { body: message }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (err) {
        console.error("❌ Reply Error:", err.response?.data || err.message);
    }
}

module.exports = router;