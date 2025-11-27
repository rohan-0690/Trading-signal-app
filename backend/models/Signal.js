import mongoose from 'mongoose';

const signalSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  timeframe: { type: String, required: true },
  signal: { type: String, enum: ['BUY', 'SELL', 'AVOID'], required: true },
  entry: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  targets: {
    t1: Number,
    t2: Number,
    t3: Number
  },
  confidence: { type: Number, min: 0, max: 100 },
  trend: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
  reason: { type: String },
  patterns: [String],
  indicators: {
    rsi: Number,
    macd: Object,
    ema: Object,
    volume: Number
  },
  riskReward: Number,
  status: { type: String, enum: ['ACTIVE', 'HIT_TARGET', 'HIT_SL', 'EXPIRED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

signalSchema.index({ symbol: 1, createdAt: -1 });
signalSchema.index({ status: 1 });

export default mongoose.model('Signal', signalSchema);
