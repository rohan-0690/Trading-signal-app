const { RSI, MACD, EMA, ATR, BollingerBands } = require('technicalindicators');

class TechnicalAnalysis {
  calculateRSI(candles, period = 14) {
    const closes = candles.map(c => c.close);
    const rsi = RSI.calculate({
      values: closes,
      period: period
    });
    return rsi[rsi.length - 1];
  }

  calculateMACD(candles) {
    const closes = candles.map(c => c.close);
    const macd = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
    return macd[macd.length - 1];
  }

  calculateEMA(candles, period) {
    const closes = candles.map(c => c.close);
    const ema = EMA.calculate({
      values: closes,
      period: period
    });
    return ema[ema.length - 1];
  }

  calculateATR(candles, period = 14) {
    const atr = ATR.calculate({
      high: candles.map(c => c.high),
      low: candles.map(c => c.low),
      close: candles.map(c => c.close),
      period: period
    });
    return atr[atr.length - 1];
  }

  calculateBollingerBands(candles, period = 20, stdDev = 2) {
    const closes = candles.map(c => c.close);
    const bb = BollingerBands.calculate({
      values: closes,
      period: period,
      stdDev: stdDev
    });
    return bb[bb.length - 1];
  }

  findSupportResistance(candles) {
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Find local maxima and minima
    const resistance = [];
    const support = [];
    
    for (let i = 2; i < candles.length - 2; i++) {
      // Resistance (local high)
      if (highs[i] > highs[i-1] && highs[i] > highs[i-2] &&
          highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
        resistance.push(highs[i]);
      }
      
      // Support (local low)
      if (lows[i] < lows[i-1] && lows[i] < lows[i-2] &&
          lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
        support.push(lows[i]);
      }
    }
    
    return {
      resistance: resistance.slice(-3),
      support: support.slice(-3)
    };
  }

  detectTrend(candles) {
    const ema20 = this.calculateEMA(candles, 20);
    const ema50 = this.calculateEMA(candles, 50);
    const currentPrice = candles[candles.length - 1].close;
    
    if (currentPrice > ema20 && ema20 > ema50) {
      return { trend: 'bullish', strength: 0.8 };
    } else if (currentPrice < ema20 && ema20 < ema50) {
      return { trend: 'bearish', strength: 0.8 };
    } else {
      return { trend: 'neutral', strength: 0.5 };
    }
  }

  analyzeVolume(candles) {
    const volumes = candles.map(c => c.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    
    return {
      current: currentVolume,
      average: avgVolume,
      strength: currentVolume / avgVolume
    };
  }

  getIndicators(candles) {
    return {
      rsi: this.calculateRSI(candles),
      macd: this.calculateMACD(candles),
      ema20: this.calculateEMA(candles, 20),
      ema50: this.calculateEMA(candles, 50),
      ema200: this.calculateEMA(candles, 200),
      atr: this.calculateATR(candles),
      bollingerBands: this.calculateBollingerBands(candles),
      supportResistance: this.findSupportResistance(candles),
      trend: this.detectTrend(candles),
      volume: this.analyzeVolume(candles)
    };
  }
}

module.exports = TechnicalAnalysis;
