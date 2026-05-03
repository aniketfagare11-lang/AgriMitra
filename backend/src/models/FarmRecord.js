const mongoose = require('mongoose');

const FarmRecordSchema = new mongoose.Schema(
  {
    farmerName: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    crop: {
      type: String,
      required: true,
      trim: true
    },
    areaHectares: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmRecord', FarmRecordSchema);

