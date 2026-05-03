const express = require('express');
const { authRequired } = require('../middleware/auth');
const Report = require('../models/Report');

const router = express.Router();

router.post('/save', authRequired, async (req, res) => {
  console.log('[POST /api/reports/save] req.body:', req.body);
  
  try {
    const { imageUrl, disease, confidence, symptoms, treatment, prevention } = req.body;
    
    // Validate incoming data
    if (!disease || typeof disease !== 'string') {
      console.error('[POST /api/reports/save] Missing or invalid disease field');
      return res.status(400).json({ ok: false, message: 'Disease/Issue name is required' });
    }

    // Safely fallback arrays
    const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];
    const safeTreatment = Array.isArray(treatment) ? treatment : [];
    const safePrevention = Array.isArray(prevention) ? prevention : [];

    const report = new Report({
      userId: req.user.sub, // 'sub' is set in authRoutes.js
      imageUrl: imageUrl || '',
      disease: disease.trim(),
      confidence: confidence || '',
      symptoms: safeSymptoms,
      treatment: safeTreatment,
      prevention: safePrevention
    });

    await report.save();

    return res.status(201).json({
      ok: true,
      message: 'Report saved successfully',
      report
    });
  } catch (error) {
    console.error('[POST /api/reports/save] Error:', error);
    // Ensure API ALWAYS returns JSON even on severe crashes
    return res.status(500).json({ ok: false, message: 'Server error saving report' });
  }
});

module.exports = router;
