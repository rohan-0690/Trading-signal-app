import axios from 'axios';
import Signal from '../models/Signal.js';
import { getHistoricalData } from './marketData.js';

export async function generateSignal(symbol, timeframe) {
  try {
    // Get historical data
    const candles = await getHistoricalData(symbol, timeframe, 200);
    
    // Send to AI engine for analysis
    const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/analyze`, {
      symbol,
      timeframe,
      candles
    });

    const analysis = aiResponse.data;
    
    // Create signal if confidence is high enough
    if (analysis.confidence >= 60 && analysis.signal !== 'AVOID') {
      const signal = await Signal.create({
        symbol,
        timeframe,
        signal: analysis.signal,
        entry: analysis.entry,
        stopLoss: analysis.stopLoss,
        targets: analysis.targets,
        confidence: analysis.confidence,
        trend: analysis.trend,
        reason: analysis.reason,
        patterns: analysis.patterns,
        indicators: analysis.indicators,
        riskReward: analysis.riskReward,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      return signal;
    }

    return analysis;
  } catch (error) {
    console.error('Signal generation error:', error.message);
    throw error;
  }
}
