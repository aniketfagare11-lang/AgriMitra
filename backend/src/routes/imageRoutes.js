const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const modePrompt = (mode, languageCode) => {
  const langMap = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    mr: 'Marathi'
  };
  const targetLanguage = langMap[languageCode] || 'English';

  if (mode === 'soil') {
    return `Analyze this soil image. Respond ONLY in ${targetLanguage}.
If the image is not a clear soil image, return EXACTLY: "Image unclear. Please upload a clearer soil image."
Otherwise, your output MUST exactly follow this structure and nothing else:
- Moisture: [Low / Normal / High]
- Nitrogen: [Low / Normal / High]
- pH: [Low / Normal / High]
- Issue: [1 short sentence]
- Solution: [2-3 actionable steps]
- Confidence: [e.g. 60-75%] (Estimated)`;
  }
  
  return `Analyze this crop image. Respond ONLY in ${targetLanguage}.
If the image is not a clear crop/plant image, return EXACTLY: "Image unclear. Please upload a clearer crop image."
Otherwise, return concise output with:
1) probable disease/stress
2) Confidence: [e.g. 60-75%] (Estimated)
3) cause of the issue
4) immediate treatment
5) prevention tips in 3 bullets.`;
};

router.post('/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'image file is required (field name: image)' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ ok: false, message: 'GROQ_API_KEY is missing in backend .env' });
  }

  const imageBase64 = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype || 'image/jpeg';
  const mode = req.body.mode === 'soil' ? 'soil' : 'crop';
  const languageCode = (req.body.language || 'en').toLowerCase();
  const prompt = req.body.prompt || modePrompt(mode, languageCode);

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.2
    })
  });

  if (!groqResponse.ok) {
    const details = await groqResponse.text();
    return res.status(502).json({
      ok: false,
      message: 'Groq API request failed',
      details
    });
  }

  const result = await groqResponse.json();
  const analysis = result?.choices?.[0]?.message?.content || 'No analysis generated.';

  return res.json({
    ok: true,
    mode,
    language: languageCode,
    analysis
  });
});

module.exports = router;
