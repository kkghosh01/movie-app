require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../Models/userModel.js");
const config = require("../config.js");

const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? `mongodb+srv://${config.dbUser}:${encodeURIComponent(
        config.dbPassword
      )}@${config.dbCluster}/${config.dbName}?appName=Cluster0`
    : `mongodb://127.0.0.1:27017/${config.dbName}`;

const createSeedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB connected...");

    const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(
        "❌ Please set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env"
      );
      process.exit();
    }

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("ℹ️ Admin already exists");
      process.exit();
    }

    const admin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword,
      confirmPassword: adminPassword,
      role: "admin",
      active: true,
    });

    console.log("✅ Admin created:", admin.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

createSeedAdmin();
