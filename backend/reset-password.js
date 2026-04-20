const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");
    
    const emailToReset = "sumitworkspace2024@gmail.com";
    const user = await User.findOne({ email: new RegExp('^' + emailToReset.trim() + '$', 'i') });
    
    if (!user) {
      console.log("User not found!");
      process.exit(1);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log("Password reset successfully to: 123456");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

reset();
