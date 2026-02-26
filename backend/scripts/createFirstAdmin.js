require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  try {
    // Connect DB directly (no server.js)
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME || "Super Admin";

    if (!email || !password) {
      throw new Error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD");
    }

    // Check if admin already exists
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("✅ Admin already exists:", existing.email);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    await User.create({
      name,
      email,
      passwordHash,
      role: "admin",
    });

    console.log("🎉 First admin created:", email);
    process.exit(0);

  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

createAdmin();