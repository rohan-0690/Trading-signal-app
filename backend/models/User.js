import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  watchlist: [{ symbol: String, market: String }],
  preferences: {
    timeframes: [String],
    markets: [String],
    minConfidence: { type: Number, default: 70 },
    riskPerTrade: { type: Number, default: 2 },
    capital: { type: Number, default: 10000 }
  },
  alerts: [{
    symbol: String,
    condition: String,
    value: Number,
    enabled: { type: Boolean, default: true }
  }],
  notifications: {
    push: { type: Boolean, default: true },
    sound: { type: Boolean, default: true },
    email: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
