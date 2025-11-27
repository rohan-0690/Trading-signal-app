const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal');
const MarketDataService = require('../services/marketDataService');
const SignalEngine = require('../services/signalEngine');

const marketDataService = new MarketDataService();
const signalEngine = new SignalEngine();

router.get('/', async (req, res) => {
  try {
    const { symbol, status, limit = 50 } = req.query;
    const query = {};
    
    if (symbol) query.symbol = symbol;
    if (status) query.status = status;
    
    const signals = await Signal.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: signals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { symbol, timeframe = '5m' } = req.body;
    
    const candles = await marketDataService.getCandles(symbol, timeframe, 100);
    const signalData = signalEngine.analyzeAndGenerateSignal(candles, symbol);
    
    if (!signalData) {
      return res.json({ success: false, message: 'No strong signal detected' });
    }
    
    const signal = new Signal(signalData);
    await signal.save();
    
    res.json({ success: true, data: signal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/accuracy', async (req, res) => {
  try {
    const signals = await Signal.find({ status: { $in: ['hit_target', 'hit_stoploss'] } });
    
    const total = signals.length;
    const successful = signals.filter(s => s.status === 'hit_target').length;
    const accuracy = total > 0 ? (successful / total) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        total,
        successful,
        failed: total - successful,
        accuracy: accuracy.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
