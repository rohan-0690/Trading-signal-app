class PatternDetector {
  detectCandlestickPatterns(candles) {
    const patterns = [];
    const len = candles.length;

    if (len < 3) return patterns;

    const current = candles[len - 1];
    const prev = candles[len - 2];
    const prev2 = candles[len - 3];

    // Hammer
    if (this.isHammer(current)) {
      patterns.push({ name: 'Hammer', bullish: true, strength: 0.7 });
    }

    // Shooting Star
    if (this.isShootingStar(current)) {
      patterns.push({ name: 'Shooting Star', bullish: false, strength: 0.7 });
    }

    // Doji
    if (this.isDoji(current)) {
      patterns.push({ name: 'Doji', bullish: null, strength: 0.5 });
    }

    // Bullish Engulfing
    if (this.isBullishEngulfing(prev, current)) {
      patterns.push({ name: 'Bullish Engulfing', bullish: true, strength: 0.85 });
    }

    // Bearish Engulfing
    if (this.isBearishEngulfing(prev, current)) {
      patterns.push({ name: 'Bearish Engulfing', bullish: false, strength: 0.85 });
    }

    // Morning Star
    if (this.isMorningStar(prev2, prev, current)) {
      patterns.push({ name: 'Morning Star', bullish: true, strength: 0.9 });
    }

    // Evening Star
    if (this.isEveningStar(prev2, prev, current)) {
      patterns.push({ name: 'Evening Star', bullish: false, strength: 0.9 });
    }

    // Three White Soldiers
    if (len >= 3 && this.isThreeWhiteSoldiers(candles.slice(-3))) {
      patterns.push({ name: 'Three White Soldiers', bullish: true, strength: 0.9 });
    }

    // Pin Bar
    if (this.isPinBar(current)) {
      patterns.push({ name: 'Pin Bar', bullish: current.close > current.open, strength: 0.75 });
    }

    return patterns;
  }

  isHammer(candle) {
    const body = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return lowerShadow > body * 2 && upperShadow < body * 0.3;
  }

  isShootingStar(candle) {
    const body = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    
    return upperShadow > body * 2 && lowerShadow < body * 0.3;
  }

  isDoji(candle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    return body < range * 0.1;
  }

  isBullishEngulfing(prev, current) {
    return prev.close < prev.open && 
           current.close > current.open &&
           current.open < prev.close &&
           current.close > prev.open;
  }

  isBearishEngulfing(prev, current) {
    return prev.close > prev.open && 
           current.close < current.open &&
           current.open > prev.close &&
           current.close < prev.open;
  }

  isMorningStar(first, second, third) {
    return first.close < first.open &&
           Math.abs(second.close - second.open) < (first.high - first.low) * 0.3 &&
           third.close > third.open &&
           third.close > (first.open + first.close) / 2;
  }

  isEveningStar(first, second, third) {
    return first.close > first.open &&
           Math.abs(second.close - second.open) < (first.high - first.low) * 0.3 &&
           third.close < third.open &&
           third.close < (first.open + first.close) / 2;
  }

  isThreeWhiteSoldiers(candles) {
    return candles.every(c => c.close > c.open) &&
           candles[1].close > candles[0].close &&
           candles[2].close > candles[1].close;
  }

  isPinBar(candle) {
    const body = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    const nose = candle.close > candle.open ? 
                 candle.high - candle.close : 
                 candle.high - candle.open;
    
    return nose > totalRange * 0.6 && body < totalRange * 0.3;
  }

  detectChartPatterns(candles) {
    const patterns = [];

    // Double Top/Bottom
    const doublePattern = this.detectDoubleTopBottom(candles);
    if (doublePattern) patterns.push(doublePattern);

    // Head and Shoulders
    const hsPattern = this.detectHeadAndShoulders(candles);
    if (hsPattern) patterns.push(hsPattern);

    // Triangle
    const trianglePattern = this.detectTriangle(candles);
    if (trianglePattern) patterns.push(trianglePattern);

    return patterns;
  }

  detectDoubleTopBottom(candles) {
    if (candles.length < 20) return null;

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Simple double top detection
    const recentHighs = highs.slice(-20);
    const maxHigh = Math.max(...recentHighs);
    const highIndices = recentHighs.map((h, i) => h > maxHigh * 0.98 ? i : -1).filter(i => i !== -1);
    
    if (highIndices.length >= 2 && highIndices[highIndices.length - 1] - highIndices[0] > 5) {
      return { name: 'Double Top', bullish: false, strength: 0.8 };
    }

    return null;
  }

  detectHeadAndShoulders(candles) {
    // Simplified H&S detection
    if (candles.length < 30) return null;
    
    const recent = candles.slice(-30);
    const highs = recent.map(c => c.high);
    const maxIdx = highs.indexOf(Math.max(...highs));
    
    if (maxIdx > 10 && maxIdx < 20) {
      const leftShoulder = Math.max(...highs.slice(0, maxIdx - 5));
      const rightShoulder = Math.max(...highs.slice(maxIdx + 5));
      const head = highs[maxIdx];
      
      if (head > leftShoulder * 1.05 && head > rightShoulder * 1.05) {
        return { name: 'Head and Shoulders', bullish: false, strength: 0.85 };
      }
    }
    
    return null;
  }

  detectTriangle(candles) {
    if (candles.length < 20) return null;
    
    const recent = candles.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    
    const highRange = Math.max(...highs) - Math.min(...highs);
    const lowRange = Math.max(...lows) - Math.min(...lows);
    
    if (highRange < lowRange * 0.5) {
      return { name: 'Ascending Triangle', bullish: true, strength: 0.75 };
    }
    
    return null;
  }
}

module.exports = PatternDetector;
