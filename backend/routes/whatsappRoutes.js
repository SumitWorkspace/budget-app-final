const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const axios = require("axios");

// =============================
// 🔹 VERIFY WEBHOOK (GET)
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
// 🔹 RECEIVE MESSAGES (POST)
// =============================
router.post("/", async (req, res) => {
  try {
    const io = req.app.get("io");

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    // 🔥 Ignore non-text
    if (!message || message.type !== "text") {
      return res.sendStatus(200);
    }

    // 🔥 Prevent duplicates
    global.processedMessages = global.processedMessages || new Set();

    if (message.id && global.processedMessages.has(message.id)) {
      console.log("⚠️ Duplicate ignored:", message.id);
      return res.sendStatus(200);
    }

    global.processedMessages.add(message.id);

    const phoneRaw = message.from;
    const text = message.text?.body?.toLowerCase();

    console.log("📩 Incoming:", phoneRaw, text);

    // =============================
    // 🔹 FIND USER
    // =============================
    const phone = phoneRaw.startsWith("91") ? phoneRaw : "91" + phoneRaw;
    const user = await User.findOne({ phone });

    if (!user) {
      console.log("❌ No user found:", phone);
      return res.sendStatus(200);
    }

    // =============================
    // 🔹 SMART PARSER (FINAL)
    // =============================
    let amount = 0;
    let category = "general";
    let type = "expense";

    // 🔥 clean text (remove ₹, commas, symbols)
    const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const words = cleanText.split(/\s+/);

    // 🔥 extract number anywhere
    const numberMatch = cleanText.match(/\d+/);
    if (numberMatch) {
      amount = parseInt(numberMatch[0]);
    }

    // 🔥 detect type
    if (cleanText.includes("spent")) {
      type = "expense";
    } else if (
      cleanText.includes("received") ||
      cleanText.includes("got") ||
      cleanText.includes("salary")
    ) {
      type = "income";
    }

    // 🔥 detect category (last non-number word)
    const nonNumbers = words.filter((w) => isNaN(w));
    if (nonNumbers.length > 0) {
      category = nonNumbers[nonNumbers.length - 1];
    }

    // 🔥 special case: "food 200"
    if (words.length === 2 && !isNaN(words[1])) {
      category = words[0];
      amount = parseInt(words[1]);
      type = "expense";
    }

    // =============================
    // ❌ INVALID FORMAT
    // =============================
    if (!amount) {
      await sendReply(
        phoneRaw,
        `❌ Invalid format!

Try:
💸 Spent 200 on food
💰 Received 5000 salary
OR:
food 200`
      );
      return res.sendStatus(200);
    }

    // =============================
    // 🔹 SAVE TRANSACTION
    // =============================
    const transaction = await Transaction.create({
      title: category,
      amount,
      category,
      description: "Added via WhatsApp",
      date: new Date(),
      type,
      user: user._id,
    });

    console.log("💾 Saved:", transaction._id);

    // =============================
    // 🔹 SOCKET EMIT
    // =============================
    io.to(user._id.toString()).emit("newTransaction", {
      _id: transaction._id,
      amount,
      category,
      type,
    });

    // =============================
    // 🔹 SEND REPLY
    // =============================
    await sendReply(
      phoneRaw,
      `✅ ${type === "expense" ? "Expense" : "Income"} added!

₹${amount} → ${category}`
    );

    return res.sendStatus(200);

  } catch (error) {
    console.error("❌ WhatsApp Error:", error.message);
    return res.sendStatus(500);
  }
});

// =============================
// 🔹 SEND REPLY FUNCTION
// =============================
async function sendReply(to, message) {
  try {
    console.log("📤 Sending reply to:", to);

    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(
      "❌ FULL ERROR:",
      JSON.stringify(err.response?.data, null, 2)
    );
  }
}

module.exports = router;