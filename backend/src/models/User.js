const mongoose = require('mongoose');

// User Schema — supports both auth (email/password) and farmer profile (phone/language)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // ── Auth fields (used by /api/auth signup & login) ──────────────────────
    email: {
      type: String,
      unique: true,
      sparse: true,          // allows multiple docs with no email (phone-only users)
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,          // bcrypt hash — NEVER store plain passwords
    },
    // ── Farmer profile fields (used by /api/users) ───────────────────────────
    phone: {
      type: String,
      unique: true,
      sparse: true,          // allows multiple docs with no phone (email-only users)
      trim: true,
    },
    language: {
      type: String,
      default: 'en',         // e.g. 'hi', 'mr', 'en'
    },
  },
  {
    timestamps: true,        // adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
