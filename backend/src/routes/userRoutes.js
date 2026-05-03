const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users — Register a new farmer
router.post('/', async (req, res) => {
  try {
    const { name, phone, language } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({ ok: false, message: 'Name and phone are required.' });
    }

    // Save user to MongoDB
    const user = new User({ name, phone, language });
    await user.save();

    res.status(201).json({ ok: true, message: 'User registered successfully!', user });
  } catch (error) {
    // Handle duplicate phone number
    if (error.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Phone number already registered.' });
    }
    console.error('Error saving user:', error.message);
    res.status(500).json({ ok: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/users — Fetch all registered farmers
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first
    res.json({ ok: true, count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ ok: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
