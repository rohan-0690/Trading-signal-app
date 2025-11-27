import Binance from 'binance-api-node';
import axios from 'axios';

const binanceClient = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET
});

const timeframeMap = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '4h': '4h', '1d': '1d'
};

export async function getMarketData(symbol, timeframe = '5m') {
  try {
    const ticker = await binanceClient.prices({ symbol });
    const candles = await binanceClient.candles({
      symbol,
      interval: timeframeMap[timeframe] || '5m',
      limit: 1
    });

    const candle = candles[0];
    return {
      symbol,
      price: parseFloat(ticker[symbol]),
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume),
      timestamp: candle.closeTime
    };
  } catch (error) {
    console.error('Market data error:', error.message);
    throw error;
  }
}

export async function getHistoricalData(symbol, timeframe = '5m', limit = 500) {
  try {
    const candles = await binanceClient.candles({
      symbol,
      interval: timeframeMap[timeframe] || '5m',
      limit
    });

    return candles.map(c => ({
      time: c.openTime,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume)
    }));
  } catch (error) {
    console.error('Historical data error:', error.message);
    throw error;
  }
}
