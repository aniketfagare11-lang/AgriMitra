require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const farmRoutes = require('./routes/farmRoutes');
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/chat', chatRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in backend .env');
    }
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

start();
