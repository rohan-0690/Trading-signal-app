// Options pricing calculator using simplified Black-Scholes model
class OptionsCalculator {
  constructor() {
    this.riskFreeRate = 0.07; // 7% risk-free rate (India)
    this.volatility = 0.15; // 15% implied volatility (average for NIFTY)
  }

  // Calculate days to expiry (assuming weekly expiry on Thursday)
  getDaysToExpiry() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Find next Thursday (4 = Thursday)
    let daysUntilThursday = (4 - dayOfWeek + 7) % 7;
    if (daysUntilThursday === 0 && today.getHours() >= 15) {
      daysUntilThursday = 7; // After market close, move to next week
    }
    
    return daysUntilThursday || 7;
  }

  // Standard normal cumulative distribution function
  normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  // Calculate option premium using Black-Scholes
  calculatePremium(spotPrice, strikePrice, optionType, daysToExpiry = null) {
    const days = daysToExpiry || this.getDaysToExpiry();
    const timeToExpiry = days / 365;
    
    if (timeToExpiry <= 0) {
      // Option expired
      return optionType === 'CE' 
        ? Math.max(0, spotPrice - strikePrice)
        : Math.max(0, strikePrice - spotPrice);
    }

    const S = spotPrice;
    const K = strikePrice;
    const r = this.riskFreeRate;
    const sigma = this.volatility;
    const T = timeToExpiry;

    // Calculate d1 and d2
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    let premium;
    if (optionType === 'CE') {
      // Call option
      premium = S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
    } else {
      // Put option
      premium = K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
    }

    // Add bid-ask spread and market adjustment
    const marketAdjustment = 1 + (Math.random() * 0.1 - 0.05); // ±5% randomness
    premium = premium * marketAdjustment;

    return Math.max(premium, 0.5); // Minimum premium of 0.5
  }

  // Calculate Greeks
  calculateGreeks(spotPrice, strikePrice, optionType, daysToExpiry = null) {
    const days = daysToExpiry || this.getDaysToExpiry();
    const timeToExpiry = days / 365;
    
    const S = spotPrice;
    const K = strikePrice;
    const r = this.riskFreeRate;
    const sigma = this.volatility;
    const T = timeToExpiry;

    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Delta
    const delta = optionType === 'CE' 
      ? this.normalCDF(d1)
      : this.normalCDF(d1) - 1;

    // Gamma
    const gamma = Math.exp(-d1 * d1 / 2) / (S * sigma * Math.sqrt(2 * Math.PI * T));

    // Theta (per day)
    const theta = optionType === 'CE'
      ? (-S * sigma * Math.exp(-d1 * d1 / 2) / (2 * Math.sqrt(2 * Math.PI * T)) - r * K * Math.exp(-r * T) * this.normalCDF(d2)) / 365
      : (-S * sigma * Math.exp(-d1 * d1 / 2) / (2 * Math.sqrt(2 * Math.PI * T)) + r * K * Math.exp(-r * T) * this.normalCDF(-d2)) / 365;

    // Vega (per 1% change in volatility)
    const vega = S * Math.sqrt(T) * Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI) / 100;

    return {
      delta: delta.toFixed(4),
      gamma: gamma.toFixed(6),
      theta: theta.toFixed(2),
      vega: vega.toFixed(2)
    };
  }

  // Get option chain for multiple strikes
  getOptionChain(spotPrice, strikeRange = 10) {
    const baseStrike = Math.round(spotPrice / 50) * 50;
    const chain = [];
    const daysToExpiry = this.getDaysToExpiry();

    for (let i = -strikeRange; i <= strikeRange; i++) {
      const strike = baseStrike + (i * 50);
      
      const callPremium = this.calculatePremium(spotPrice, strike, 'CE', daysToExpiry);
      const putPremium = this.calculatePremium(spotPrice, strike, 'PE', daysToExpiry);
      
      const callGreeks = this.calculateGreeks(spotPrice, strike, 'CE', daysToExpiry);
      const putGreeks = this.calculateGreeks(spotPrice, strike, 'PE', daysToExpiry);

      chain.push({
        strike,
        call: {
          premium: parseFloat(callPremium.toFixed(2)),
          greeks: callGreeks,
          oi: Math.floor(Math.random() * 100000) + 10000, // Simulated OI
          volume: Math.floor(Math.random() * 50000) + 5000 // Simulated volume
        },
        put: {
          premium: parseFloat(putPremium.toFixed(2)),
          greeks: putGreeks,
          oi: Math.floor(Math.random() * 100000) + 10000,
          volume: Math.floor(Math.random() * 50000) + 5000
        }
      });
    }

    return {
      spotPrice,
      daysToExpiry,
      chain,
      timestamp: Date.now()
    };
  }
}

module.exports = OptionsCalculator;
