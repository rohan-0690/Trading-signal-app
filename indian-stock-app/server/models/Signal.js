const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sector: {
    type: String
  },
  timeframe: {
    type: String,
    required: true
  },
  duration: {
    estimatedMinutes: Number,
    tradingStyle: String,
    holdingPeriod: String,
    targetDistance: Number,
    percentMove: Number
  },
  signal: {
    type: String,
    enum: ['BUY', 'SELL', 'AVOID'],
    required: true
  },
  entry: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    required: true
  },
  targets: {
    t1: Number,
    t2: Number,
    t3: Number
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  reason: {
    type: String
  },
  patterns: [{
    type: String
  }],
  indicators: {
    rsi: Number,
    macd: Object,
    ema: Object,
    volume: Number
  },
  riskReward: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'hit_target', 'hit_stoploss', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Signal', signalSchema);
