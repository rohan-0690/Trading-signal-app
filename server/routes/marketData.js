const express = require('express');
const router = express.Router();
const MarketDataService = require('../services/marketDataService');

const marketDataService = new MarketDataService();

router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '5m', limit = 100 } = req.query;
    
    const candles = await marketDataService.getCandles(symbol, interval, parseInt(limit));
    res.json({ success: true, data: candles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await marketDataService.getCurrentPrice(symbol);
    res.json({ success: true, data: { symbol, price } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
