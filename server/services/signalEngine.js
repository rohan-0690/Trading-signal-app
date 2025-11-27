const PatternDetector = require('./patternDetector');
const TechnicalAnalysis = require('./technicalAnalysis');

class SignalEngine {
  constructor() {
    this.patternDetector = new PatternDetector();
    this.technicalAnalysis = new TechnicalAnalysis();
  }

  analyzeAndGenerateSignal(candles, symbol) {
    if (candles.length < 50) return null;

    const currentPrice = candles[candles.length - 1].close;
    
    // Detect patterns
    const candlePatterns = this.patternDetector.detectCandlestickPatterns(candles);
    const chartPatterns = this.patternDetector.detectChartPatterns(candles);
    
    // Get technical indicators
    const indicators = this.technicalAnalysis.getIndicators(candles);
    
    // Calculate signal
    const signal = this.calculateSignal(candlePatterns, chartPatterns, indicators, currentPrice);
    
    if (!signal || signal.signal === 'AVOID') return null;

    return {
      symbol,
      timeframe: '5m',
      signal: signal.signal,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      targets: signal.targets,
      confidence: signal.confidence,
      reason: signal.reason,
      patterns: [...candlePatterns.map(p => p.name), ...chartPatterns.map(p => p.name)],
      indicators: {
        rsi: indicators.rsi,
        macd: indicators.macd,
        ema: {
          ema20: indicators.ema20,
          ema50: indicators.ema50
        },
        volume: indicators.volume.strength
      },
      riskReward: signal.riskReward,
      timestamp: Date.now()
    };
  }

  calculateSignal(candlePatterns, chartPatterns, indicators, currentPrice) {
    let bullishScore = 0;
    let bearishScore = 0;
    const reasons = [];

    // Pattern scoring
    candlePatterns.forEach(pattern => {
      if (pattern.bullish === true) {
        bullishScore += pattern.strength * 20;
        reasons.push(pattern.name);
      } else if (pattern.bullish === false) {
        bearishScore += pattern.strength * 20;
        reasons.push(pattern.name);
      }
    });

    chartPatterns.forEach(pattern => {
      if (pattern.bullish === true) {
        bullishScore += pattern.strength * 15;
        reasons.push(pattern.name);
      } else if (pattern.bullish === false) {
        bearishScore += pattern.strength * 15;
        reasons.push(pattern.name);
      }
    });

    // RSI scoring
    if (indicators.rsi < 30) {
      bullishScore += 15;
      reasons.push('RSI Oversold');
    } else if (indicators.rsi > 70) {
      bearishScore += 15;
      reasons.push('RSI Overbought');
    }

    // MACD scoring
    if (indicators.macd && indicators.macd.MACD > indicators.macd.signal) {
      bullishScore += 10;
      reasons.push('MACD Bullish');
    } else if (indicators.macd && indicators.macd.MACD < indicators.macd.signal) {
      bearishScore += 10;
      reasons.push('MACD Bearish');
    }

    // EMA crossover
    if (indicators.ema20 > indicators.ema50) {
      bullishScore += 10;
      reasons.push('EMA Crossover Bullish');
    } else if (indicators.ema20 < indicators.ema50) {
      bearishScore += 10;
      reasons.push('EMA Crossover Bearish');
    }

    // Volume
    if (indicators.volume.strength > 1.5) {
      reasons.push('High Volume');
      if (bullishScore > bearishScore) {
        bullishScore += 10;
      } else {
        bearishScore += 10;
      }
    }

    // Trend
    if (indicators.trend.trend === 'bullish') {
      bullishScore += indicators.trend.strength * 15;
    } else if (indicators.trend.trend === 'bearish') {
      bearishScore += indicators.trend.strength * 15;
    }

    // Determine signal
    const totalScore = bullishScore + bearishScore;
    const confidence = Math.min(Math.max(bullishScore, bearishScore), 100);

    if (confidence < 60) {
      return { signal: 'AVOID', confidence: 0 };
    }

    const atr = indicators.atr;
    let signal, entry, stopLoss, targets, riskReward;

    if (bullishScore > bearishScore) {
      signal = 'BUY';
      entry = currentPrice;
      stopLoss = currentPrice - (atr * 1.5);
      targets = {
        t1: currentPrice + (atr * 1.5),
        t2: currentPrice + (atr * 2.5),
        t3: currentPrice + (atr * 4)
      };
      riskReward = (targets.t1 - entry) / (entry - stopLoss);
    } else {
      signal = 'SELL';
      entry = currentPrice;
      stopLoss = currentPrice + (atr * 1.5);
      targets = {
        t1: currentPrice - (atr * 1.5),
        t2: currentPrice - (atr * 2.5),
        t3: currentPrice - (atr * 4)
      };
      riskReward = (entry - targets.t1) / (stopLoss - entry);
    }

    return {
      signal,
      entry: parseFloat(entry.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      targets: {
        t1: parseFloat(targets.t1.toFixed(2)),
        t2: parseFloat(targets.t2.toFixed(2)),
        t3: parseFloat(targets.t3.toFixed(2))
      },
      confidence: Math.round(confidence),
      reason: reasons.join(' + '),
      riskReward: parseFloat(riskReward.toFixed(2))
    };
  }
}

module.exports = SignalEngine;
