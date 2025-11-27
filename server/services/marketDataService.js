const axios = require('axios');

class MarketDataService {
  constructor() {
    this.binanceBaseUrl = 'https://api.binance.com/api/v3';
    this.alphaVantageBaseUrl = 'https://www.alphavantage.co/query';
  }

  async getCandles(symbol, interval, limit = 100) {
    try {
      const response = await axios.get(`${this.binanceBaseUrl}/klines`, {
        params: {
          symbol: symbol,
          interval: interval,
          limit: limit
        }
      });

      return response.data.map(candle => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
    } catch (error) {
      console.error('Error fetching candles:', error);
      throw error;
    }
  }

  async getCurrentPrice(symbol) {
    try {
      const response = await axios.get(`${this.binanceBaseUrl}/ticker/price`, {
        params: { symbol }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  async getStockData(symbol) {
    try {
      const response = await axios.get(this.alphaVantageBaseUrl, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: '5min',
          apikey: process.env.ALPHA_VANTAGE_KEY
        }
      });

      const timeSeries = response.data['Time Series (5min)'];
      return Object.entries(timeSeries).map(([timestamp, data]) => ({
        timestamp: new Date(timestamp).getTime(),
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseFloat(data['5. volume'])
      }));
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  }
}

module.exports = MarketDataService;
