const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  disease: {
    type: String,
    required: true
  },
  confidence: {
    type: String,
    default: ''
  },
  symptoms: {
    type: [String],
    default: []
  },
  treatment: {
    type: [String],
    default: []
  },
  prevention: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
