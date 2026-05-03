const express = require('express');
const FarmRecord = require('../models/FarmRecord');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, async (_req, res) => {
  const records = await FarmRecord.find().sort({ createdAt: -1 }).limit(50);
  res.json(records);
});

router.post('/', authRequired, async (req, res) => {
  const { farmerName, district, crop, areaHectares } = req.body;
  const created = await FarmRecord.create({
    farmerName,
    district,
    crop,
    areaHectares
  });
  res.status(201).json(created);
});

module.exports = router;
