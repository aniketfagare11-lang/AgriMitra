const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, message: 'name, email, password are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ ok: false, message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken(user);
  return res.status(201).json({
    ok: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});

router.post('/login', async (req, res) => {
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
    user: { id: user._id, name: user.name, email: user.email }
  });
});

router.get('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.sub).select('_id name email createdAt');
  if (!user) {
    return res.status(404).json({ ok: false, message: 'User not found' });
  }
  return res.json({ ok: true, user });
});

module.exports = router;

