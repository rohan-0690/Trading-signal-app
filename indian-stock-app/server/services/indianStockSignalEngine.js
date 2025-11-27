const PatternDetector = require('./patternDetector');
const TechnicalAnalysis = require('./technicalAnalysis');

class IndianStockSignalEngine {
  constructor() {
    this.patternDetector = new PatternDetector();
    this.technicalAnalysis = new TechnicalAnalysis();
  }

  analyzeStock(candles, stockInfo) {
    if (candles.length < 50) {
      return null;
    }

    const currentPrice = candles[candles.length - 1].close;
    
    // Detect patterns
    const candlePatterns = this.patternDetector.detectCandlestickPatterns(candles);
    const chartPatterns = this.patternDetector.detectChartPatterns(candles);
    
    // Get technical indicators
    const indicators = this.technicalAnalysis.getIndicators(candles);
    
    // Calculate signal
    const signal = this.calculateIndianStockSignal(
      candlePatterns,
      chartPatterns,
      indicators,
      currentPrice,
      stockInfo
    );
    
    if (!signal || signal.action === 'HOLD') {
      return null;
    }

    // Calculate expected duration based on timeframe and targets
    const duration = this.calculateDuration(signal, indicators);
    
    return {
      ...stockInfo,
      action: signal.action,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      targets: signal.targets,
      confidence: signal.confidence,
      reason: signal.reason,
      timeframe: '5m',
      duration: duration,
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

  calculateIndianStockSignal(candlePatterns, chartPatterns, indicators, currentPrice, stockInfo) {
    let bullishScore = 0;
    let bearishScore = 0;
    const reasons = [];

    // Pattern scoring (increased weights for more signals)
    candlePatterns.forEach(pattern => {
      if (pattern.bullish === true) {
        bullishScore += pattern.strength * 25;
        reasons.push(pattern.name);
      } else if (pattern.bullish === false) {
        bearishScore += pattern.strength * 25;
        reasons.push(pattern.name);
      }
    });

    chartPatterns.forEach(pattern => {
      if (pattern.bullish === true) {
        bullishScore += pattern.strength * 20;
        reasons.push(pattern.name);
      } else if (pattern.bullish === false) {
        bearishScore += pattern.strength * 20;
        reasons.push(pattern.name);
      }
    });

    // RSI scoring (relaxed thresholds for more signals)
    if (indicators.rsi < 40) {
      bullishScore += 18;
      reasons.push('RSI Oversold');
    } else if (indicators.rsi > 60) {
      bearishScore += 18;
      reasons.push('RSI Overbought');
    } else if (indicators.rsi >= 40 && indicators.rsi <= 50) {
      bullishScore += 8;
      reasons.push('RSI Neutral-Bullish');
    } else if (indicators.rsi >= 50 && indicators.rsi <= 60) {
      bearishScore += 8;
      reasons.push('RSI Neutral-Bearish');
    }

    // MACD scoring
    if (indicators.macd && indicators.macd.MACD > indicators.macd.signal) {
      bullishScore += 12;
      reasons.push('MACD Bullish Crossover');
    } else if (indicators.macd && indicators.macd.MACD < indicators.macd.signal) {
      bearishScore += 12;
      reasons.push('MACD Bearish Crossover');
    }

    // EMA crossover
    if (indicators.ema20 > indicators.ema50) {
      bullishScore += 10;
      reasons.push('Golden Cross (EMA)');
    } else if (indicators.ema20 < indicators.ema50) {
      bearishScore += 10;
      reasons.push('Death Cross (EMA)');
    }

    // Volume analysis (important for Indian stocks)
    if (indicators.volume.strength > 1.5) {
      reasons.push('High Volume Breakout');
      if (bullishScore > bearishScore) {
        bullishScore += 15;
      } else {
        bearishScore += 15;
      }
    } else if (indicators.volume.strength > 1.2) {
      reasons.push('Above Average Volume');
      if (bullishScore > bearishScore) {
        bullishScore += 8;
      } else {
        bearishScore += 8;
      }
    }
    
    // Add base score if no patterns detected (to generate signals based on indicators alone)
    if (candlePatterns.length === 0 && chartPatterns.length === 0) {
      if (indicators.rsi < 45 && indicators.ema20 > indicators.ema50) {
        bullishScore += 15;
        reasons.push('Technical Indicators Bullish');
      } else if (indicators.rsi > 55 && indicators.ema20 < indicators.ema50) {
        bearishScore += 15;
        reasons.push('Technical Indicators Bearish');
      }
    }

    // Trend analysis
    if (indicators.trend.trend === 'bullish') {
      bullishScore += indicators.trend.strength * 15;
      reasons.push('Strong Uptrend');
    } else if (indicators.trend.trend === 'bearish') {
      bearishScore += indicators.trend.strength * 15;
      reasons.push('Strong Downtrend');
    }

    // Support/Resistance levels
    const sr = indicators.supportResistance;
    if (sr.support.length > 0) {
      const nearSupport = sr.support.some(s => Math.abs(currentPrice - s) / currentPrice < 0.02);
      if (nearSupport) {
        bullishScore += 8;
        reasons.push('Near Support Level');
      }
    }
    if (sr.resistance.length > 0) {
      const nearResistance = sr.resistance.some(r => Math.abs(currentPrice - r) / currentPrice < 0.02);
      if (nearResistance) {
        bearishScore += 8;
        reasons.push('Near Resistance Level');
      }
    }

    // Calculate confidence
    const confidence = Math.min(Math.max(bullishScore, bearishScore), 100);

    // Minimum confidence threshold for Indian stocks (lowered for more signals)
    if (confidence < 50) {
      return { action: 'HOLD', confidence: 0 };
    }
    
    // If scores are too close, it's neutral - HOLD
    if (Math.abs(bullishScore - bearishScore) < 10) {
      return { action: 'HOLD', confidence: 0 };
    }

    const atr = indicators.atr;
    let action, entry, stopLoss, targets, riskReward;

    if (bullishScore > bearishScore) {
      action = 'BUY';
      entry = currentPrice;
      
      // Stop loss: 1.5% below entry or ATR-based
      const atrStopLoss = currentPrice - (atr * 1.5);
      const percentStopLoss = currentPrice * 0.985; // 1.5% below
      stopLoss = Math.max(atrStopLoss, percentStopLoss);
      
      // Targets for Indian stocks (conservative)
      targets = {
        t1: currentPrice + (atr * 1.5),  // First target: 1.5 ATR
        t2: currentPrice + (atr * 2.5),  // Second target: 2.5 ATR
        t3: currentPrice + (atr * 4)     // Third target: 4 ATR
      };
      
      riskReward = (targets.t1 - entry) / (entry - stopLoss);
    } else {
      action = 'SELL';
      entry = currentPrice;
      
      // Stop loss: 1.5% above entry or ATR-based
      const atrStopLoss = currentPrice + (atr * 1.5);
      const percentStopLoss = currentPrice * 1.015; // 1.5% above
      stopLoss = Math.min(atrStopLoss, percentStopLoss);
      
      // Targets for short selling
      targets = {
        t1: currentPrice - (atr * 1.5),
        t2: currentPrice - (atr * 2.5),
        t3: currentPrice - (atr * 4)
      };
      
      riskReward = (entry - targets.t1) / (stopLoss - entry);
    }

    // Only recommend if risk-reward is favorable (lowered threshold)
    if (riskReward < 0.8) {
      return { action: 'HOLD', confidence: 0 };
    }

    return {
      action,
      entry: parseFloat(entry.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      targets: {
        t1: parseFloat(targets.t1.toFixed(2)),
        t2: parseFloat(targets.t2.toFixed(2)),
        t3: parseFloat(targets.t3.toFixed(2))
      },
      confidence: Math.round(confidence),
      reason: reasons.slice(0, 4).join(' + '),
      riskReward: parseFloat(riskReward.toFixed(2))
    };
  }

  // Calculate expected trade duration
  calculateDuration(signal, indicators) {
    const atr = indicators.atr;
    const currentPrice = signal.entry;
    const targetDistance = Math.abs(signal.targets.t1 - currentPrice);
    const percentMove = (targetDistance / currentPrice) * 100;
    
    // Estimate duration based on volatility and target distance
    let estimatedMinutes;
    let tradingStyle;
    let holdingPeriod;
    
    if (percentMove < 0.5) {
      // Very small move - scalping
      estimatedMinutes = 15;
      tradingStyle = 'Scalping';
      holdingPeriod = '15-30 minutes';
    } else if (percentMove < 1) {
      // Small move - intraday
      estimatedMinutes = 60;
      tradingStyle = 'Intraday';
      holdingPeriod = '1-2 hours';
    } else if (percentMove < 2) {
      // Medium move - intraday to swing
      estimatedMinutes = 180;
      tradingStyle = 'Intraday/Swing';
      holdingPeriod = '3-6 hours';
    } else if (percentMove < 3) {
      // Larger move - swing trading
      estimatedMinutes = 1440; // 1 day
      tradingStyle = 'Swing Trading';
      holdingPeriod = '1-3 days';
    } else {
      // Very large move - positional
      estimatedMinutes = 4320; // 3 days
      tradingStyle = 'Positional';
      holdingPeriod = '3-7 days';
    }
    
    // Adjust based on volume (high volume = faster moves)
    if (indicators.volume.strength > 1.5) {
      estimatedMinutes = Math.floor(estimatedMinutes * 0.7);
    }
    
    return {
      estimatedMinutes,
      tradingStyle,
      holdingPeriod,
      targetDistance: parseFloat(targetDistance.toFixed(2)),
      percentMove: parseFloat(percentMove.toFixed(2))
    };
  }

  // Sector-specific analysis
  analyzeSector(stocks, sectorName) {
    const sectorStocks = stocks.filter(s => s.sector === sectorName);
    const bullishCount = sectorStocks.filter(s => s.action === 'BUY').length;
    const bearishCount = sectorStocks.filter(s => s.action === 'SELL').length;
    
    return {
      sector: sectorName,
      totalStocks: sectorStocks.length,
      bullish: bullishCount,
      bearish: bearishCount,
      sentiment: bullishCount > bearishCount ? 'Bullish' : bearishCount > bullishCount ? 'Bearish' : 'Neutral'
    };
  }
}

module.exports = IndianStockSignalEngine;
