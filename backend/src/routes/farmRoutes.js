const express = require('express');
const FarmRecord = require('../models/FarmRecord');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const records = await FarmRecord.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(50);
  res.json(records);
});

router.post('/', authRequired, async (req, res) => {
  const { farmerName, district, crop, areaHectares } = req.body;
  const created = await FarmRecord.create({
    userId: req.user.sub,
    farmerName,
    district,
    crop,
    areaHectares
  });
  res.status(201).json(created);
});

module.exports = router;
