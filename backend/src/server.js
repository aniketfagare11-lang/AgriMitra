// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes   = require('./routes/authRoutes');
const farmRoutes   = require('./routes/farmRoutes');
const imageRoutes  = require('./routes/imageRoutes');
const ttsRoutes    = require('./routes/ttsRoutes');
const chatRoutes   = require('./routes/chatRoutes');
const userRoutes   = require('./routes/userRoutes');   // ← new simple user route
const reportRoutes = require('./routes/reportRoutes'); // Crop/Soil report route

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth',   authRoutes);
app.use('/api/farm',   farmRoutes);
app.use('/api/image',  imageRoutes);
app.use('/api/tts',    ttsRoutes);
app.use('/api/chat',   chatRoutes);
app.use('/api/users',  userRoutes);   // POST & GET /api/users
app.use('/api/reports', reportRoutes); // POST /api/reports/save

app.get('/api/test5000', (req, res) => res.json({ ok: true, message: 'Server is updating!' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in backend .env');
    }

    await connectDB();  // Connect to MongoDB Atlas

    app.listen(PORT, () => {
      console.log(`🚀 AgriMitra backend running → http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  }
};

start();
