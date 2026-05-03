const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Helper — sign a JWT token for the user
const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    console.log('[signup] req.body:', req.body); // debug log

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: 'name, email, password are required' });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ ok: false, message: 'Email already registered' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    const token = signToken(user);
    return res.status(201).json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('[signup] error:', error.message);
    return res.status(500).json({ ok: false, message: 'Signup failed. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    console.log('[login] req.body:', req.body); // debug log

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('[login] error:', error.message);
    return res.status(500).json({ ok: false, message: 'Login failed. Please try again.' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('_id name email createdAt');
    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }
    return res.json({ ok: true, user });
  } catch (error) {
    console.error('[me] error:', error.message);
    return res.status(500).json({ ok: false, message: 'Could not fetch user.' });
  }
});

module.exports = router;
