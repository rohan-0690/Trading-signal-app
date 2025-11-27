const yahooFinance = require('yahoo-finance2').default;

class NSEDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  async getStockData(symbol, period = '1d', interval = '5m') {
    try {
      const cacheKey = `${symbol}_${period}_${interval}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const result = await yahooFinance.chart(symbol, {
        period1: this.getPeriodStart(period),
        interval: interval
      });

      const candles = result.quotes.map(quote => ({
        timestamp: quote.date.getTime(),
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume
      }));

      this.cache.set(cacheKey, {
        data: candles,
        timestamp: Date.now()
      });

      return candles;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getCurrentPrice(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol: symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        previousClose: quote.regularMarketPreviousClose,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getMultipleQuotes(symbols) {
    try {
      const quotes = await yahooFinance.quote(symbols);
      return Array.isArray(quotes) ? quotes : [quotes];
    } catch (error) {
      console.error('Error fetching multiple quotes:', error.message);
      throw error;
    }
  }

  getPeriodStart(period) {
    const now = new Date();
    const periodMap = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365
    };
    
    const days = periodMap[period] || 1;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  async getNifty50Index() {
    try {
      const quote = await yahooFinance.quote('^NSEI');
      return {
        symbol: 'NIFTY 50',
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow
      };
    } catch (error) {
      console.error('Error fetching Nifty 50 index:', error.message);
      throw error;
    }
  }

  async getSensexIndex() {
    try {
      const quote = await yahooFinance.quote('^BSESN');
      return {
        symbol: 'SENSEX',
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow
      };
    } catch (error) {
      console.error('Error fetching Sensex index:', error.message);
      throw error;
    }
  }
}

module.exports = NSEDataService;
