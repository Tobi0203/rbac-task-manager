const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  // Optional for Google-auth users
  password: { type: String },
  // For Google OAuth users
  googleId: { type: String }, // e.g., sub from JWT
  picture: { type: String }, // optional: Google profile picture
  authType: { type: String, enum: ["local", "google"], required: true }, // login method
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user", // Always defaults to "user"
  },
  createdAt: { type: Date, default: Date.now },
  
});

module.exports = mongoose.model("User", userSchema);
