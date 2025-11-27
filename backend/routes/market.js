import express from 'express';
import { getMarketData, getHistoricalData } from '../services/marketData.js';

const router = express.Router();

router.get('/data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '5m' } = req.query;
    const data = await getMarketData(symbol, timeframe);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '5m', limit = 500 } = req.query;
    const data = await getHistoricalData(symbol, timeframe, parseInt(limit));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
