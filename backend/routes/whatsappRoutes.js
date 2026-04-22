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

    if (!message) return res.sendStatus(200);

    const phoneRaw = message.from;
    const text = message.text?.body?.toLowerCase();

    console.log("📩 Incoming:", phoneRaw, text);

    // =============================
    // 🔹 FIND USER
    // =============================
    const phone = phoneRaw.startsWith("91") ? phoneRaw : "91" + phoneRaw;

    const user = await User.findOne({ phone });

    if (!user) {
      console.log("❌ No user found for phone:", phone);
      return res.sendStatus(200);
    }

    // =============================
    // 🔹 PARSE MESSAGE
    // =============================
    let amount = 0;
    let category = "general";
    let type = "expense";

    const words = text.split(" ");

    // Example: "spent 200 on food"
    if (text.includes("spent")) {
      type = "expense";
      amount = parseInt(words.find(w => !isNaN(w)));
      category = words[words.length - 1];
    }
    // Example: "received 5000 salary"
    else if (text.includes("received")) {
      type = "income";
      amount = parseInt(words.find(w => !isNaN(w)));
      category = words[words.length - 1];
    }
    // Example: "food 200"
    else if (words.length === 2 && !isNaN(words[1])) {
      category = words[0];
      amount = parseInt(words[1]);
      type = "expense";
    }

    if (!amount) {
      await sendReply(phoneRaw, `❌ Invalid format!

Try:
💸 Spent 200 on food
💰 Received 5000 salary
OR:
food 200`);
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
      user: user._id
    });

    console.log("💾 Transaction saved:", transaction._id);

    // =============================
    // 🔹 SOCKET EMIT (USER ONLY)
    // =============================
    io.to(user._id.toString()).emit("newTransaction", {
      amount,
      category,
      type
    });

    // =============================
    // 🔹 SEND CONFIRMATION
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
    await axios.post(
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
  } catch (err) {
    console.error("❌ Reply Error:", err.response?.data || err.message);
  }
}

module.exports = router;