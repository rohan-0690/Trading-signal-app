import express from 'express';
import Signal from '../models/Signal.js';
import { generateSignal } from '../services/signalGenerator.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { symbol, status = 'ACTIVE', limit = 50 } = req.query;
    const query = status ? { status } : {};
    if (symbol) query.symbol = symbol;
    
    const signals = await Signal.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { symbol, timeframe } = req.body;
    const signal = await generateSignal(symbol, timeframe);
    res.json(signal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/accuracy', async (req, res) => {
  try {
    const total = await Signal.countDocuments({ status: { $ne: 'ACTIVE' } });
    const successful = await Signal.countDocuments({ status: 'HIT_TARGET' });
    const accuracy = total > 0 ? (successful / total * 100).toFixed(2) : 0;
    
    res.json({ total, successful, accuracy: parseFloat(accuracy) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
