const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  value: {
    type: Number
  },
  active: {
    type: Boolean,
    default: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);
