const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ ok: false, message: 'GROQ_API_KEY is missing in backend .env' });
  }

  const { messages, language, weatherContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ ok: false, message: 'messages array is required' });
  }

  const langMap = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    mr: 'Marathi'
  };
  const targetLanguage = langMap[(language || 'en').toLowerCase()] || 'English';

  try {
    let systemPrompt = `You are KrushiMitra, a helpful AI assistant for farmers. You must respond ONLY in ${targetLanguage}. Keep your answers concise, practical, and friendly.`;
    
    if (weatherContext) {
      systemPrompt += ` The current weather at the user's location (Lat: ${weatherContext.lat}, Lon: ${weatherContext.lon}) is ${weatherContext.temp}°C and ${weatherContext.condition}. Use this information if the user asks about the weather.`;
    }
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.5
      })
    });

    if (!groqResponse.ok) {
      const details = await groqResponse.text();
      return res.status(502).json({ ok: false, message: 'Groq API request failed', details });
    }

    const result = await groqResponse.json();
    const reply = result?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return res.json({ ok: true, reply });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error', details: error.message });
  }
});

module.exports = router;
