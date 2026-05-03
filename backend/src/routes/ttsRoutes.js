const express = require('express');
const googleTTS = require('google-tts-api');

const router = express.Router();

const langMap = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  mr: 'mr'
};

const cleanTextForTTS = (text) => {
  return text
    .replace(/\*\*/g, '')          // Remove bold **
    .replace(/\*/g, '')           // Remove single *
    .replace(/^\d+\.\s+/gm, '')   // Remove "1. ", "2. " at start of lines
    .replace(/\n/g, ' ')          // Replace newlines with spaces for flow
    .replace(/\s+/g, ' ')         // Collapse multiple spaces
    .trim();
};

router.post('/', async (req, res) => {
  const rawText = (req.body.text || '').toString();
  const text = cleanTextForTTS(rawText);
  const language = (req.body.language || 'en').toString().toLowerCase();

  if (!text) {
    return res.status(400).json({ ok: false, message: 'text is required' });
  }

  const lang = langMap[language] || 'en';

  try {
    const urls = googleTTS.getAllAudioUrls(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?'
    });

    const buffers = [];
    for (const item of urls) {
      const audioResponse = await fetch(item.url);
      if (!audioResponse.ok) {
        const details = await audioResponse.text();
        return res.status(502).json({ ok: false, message: 'TTS provider failed', details });
      }
      buffers.push(Buffer.from(await audioResponse.arrayBuffer()));
    }

    const audioBuffer = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error.message);
    return res.status(500).json({ ok: false, message: 'Failed to process TTS', details: error.message });
  }
});

module.exports = router;

