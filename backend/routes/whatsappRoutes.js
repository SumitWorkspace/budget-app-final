const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const axios = require("axios");

// =============================
// 🔹 VERIFY WEBHOOK
// =============================
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// =============================
// 🔹 RECEIVE MESSAGE
// =============================
router.post("/", async (req, res) => {
  try {
    const io = req.app.get("io");

    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      return res.sendStatus(200);
    }

    // 🔥 DUPLICATE PREVENTION
    global.processedMessages = global.processedMessages || new Set();

    if (global.processedMessages.has(message.id)) {
      return res.sendStatus(200);
    }

    global.processedMessages.add(message.id);

    const phoneRaw = message.from;
    const text = message.text.body.toLowerCase();

    console.log("📩 Incoming:", text);

    // =============================
    // 🔹 FIND USER
    // =============================
    const phone = phoneRaw.startsWith("91") ? phoneRaw : "91" + phoneRaw;
    const user = await User.findOne({ phone });

    if (!user) {
      console.log("❌ User not found:", phone);
      return res.sendStatus(200);
    }

    // =============================
    // 🔥 SMART PARSER
    // =============================
    let amount = 0;
    let category = "general";
    let type = "expense";

    // clean text
    const clean = text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const words = clean.split(/\s+/);

    // 🔥 extract number
    const numMatch = clean.match(/\d+/);
    if (numMatch) amount = parseInt(numMatch[0]);

    // 🔥 detect income keywords
    const incomeKeywords = [
      "salary",
      "income",
      "received",
      "got",
      "earned",
      "bonus",
      "credit",
      "credited"
    ];

    // 🔥 detect expense keywords
    const expenseKeywords = [
      "spent",
      "pay",
      "paid",
      "debit",
      "buy",
      "bought"
    ];

    if (incomeKeywords.some(k => clean.includes(k))) {
      type = "income";
    } else if (expenseKeywords.some(k => clean.includes(k))) {
      type = "expense";
    } else {
      type = "expense"; // default
    }

    // 🔥 detect category
    const ignoreWords = [
      "spent",
      "on",
      "for",
      "received",
      "got",
      "earned",
      "paid",
      "pay",
      "from"
    ];

    const possible = words.filter(
      w => isNaN(w) && !ignoreWords.includes(w)
    );

    if (possible.length > 0) {
      category = possible[possible.length - 1];
    }

    // 🔥 fallback: "food 200"
    if (words.length === 2 && !isNaN(words[1])) {
      category = words[0];
      amount = parseInt(words[1]);
      type = incomeKeywords.includes(words[0]) ? "income" : "expense";
    }

    // =============================
    // ❌ INVALID CASE
    // =============================
    if (!amount) {
      await sendReply(
        phoneRaw,
        `❌ Couldn't understand.

Try:
💸 Spent 200 on food
💰 Received 5000 salary
🍔 food 200`
      );
      return res.sendStatus(200);
    }

    // =============================
    // 💾 SAVE TRANSACTION
    // =============================
    const transaction = await Transaction.create({
      title: category,
      amount,
      category,
      description: "WhatsApp entry",
      date: new Date(),
      type,
      user: user._id
    });

    console.log("💾 Saved:", transaction._id);

    // =============================
    // 🔴 SOCKET UPDATE
    // =============================
    io.to(user._id.toString()).emit("newTransaction", {
      _id: transaction._id,
      amount,
      category,
      type
    });

    // =============================
    // 📤 SEND REPLY
    // =============================
    await sendReply(
      phoneRaw,
      `✅ ${type === "income" ? "Income" : "Expense"} added

₹${amount} → ${category}`
    );

    res.sendStatus(200);

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.sendStatus(500);
  }
});

// =============================
// 🔹 SEND WHATSAPP REPLY
// =============================
async function sendReply(to, message) {
  try {
    console.log("📤 Sending reply...");

    const res = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Reply sent:", res.data);

  } catch (err) {
    console.error("❌ Reply error:", JSON.stringify(err.response?.data, null, 2));
  }
}

module.exports = router;