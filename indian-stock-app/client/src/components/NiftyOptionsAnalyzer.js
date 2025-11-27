import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Loader, Target, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './NiftyOptionsAnalyzer.css';

function NiftyOptionsAnalyzer({ onClose }) {
  const [niftyPrice, setNiftyPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrike, setSelectedStrike] = useState('');
  const [optionType, setOptionType] = useState('CE');
  const [premium, setPremium] = useState('');
  const [lotSize, setLotSize] = useState('1');
  const [analysis, setAnalysis] = useState(null);
  
  const NIFTY_LOT_SIZE = 75; // NIFTY 50 lot size is 75 units

  useEffect(() => {
    fetchNiftyPrice();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNiftyPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNiftyPrice = async () => {
    try {
      const response = await axios.get('/api/index/nifty50');
      if (response.data.success) {
        setNiftyPrice(response.data.data);
        generateStrikes(response.data.data.price);
      }
    } catch (error) {
      toast.error('Error fetching NIFTY price');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateStrikes = (spotPrice) => {
    const roundedPrice = Math.round(spotPrice / 50) * 50;
    setSelectedStrike(roundedPrice.toString());
    
    // Fetch live premium for ATM strike
    fetchLivePremium(roundedPrice, optionType);
  };

  const getStrikeOptions = () => {
    if (!niftyPrice) return [];
    const spot = niftyPrice.price;
    const strikes = [];
    const base = Math.round(spot / 50) * 50;
    
    for (let i = -10; i <= 10; i++) {
      strikes.push(base + (i * 50));
    }
    return strikes;
  };

  const estimatePremium = (strike, spot, optionType) => {
    const moneyness = optionType === 'CE' 
      ? ((spot - strike) / spot * 100)
      : ((strike - spot) / spot * 100);
    
    const absMoneyness = Math.abs(moneyness);
    
    // Estimate premium based on moneyness
    let estimatedPremium;
    
    if (absMoneyness < 0.5) {
      // ATM - highest premium
      estimatedPremium = spot * 0.015; // ~1.5% of spot
    } else if (moneyness > 0) {
      // ITM
      const intrinsicValue = Math.abs(spot - strike);
      const timeValue = spot * 0.01 * Math.exp(-absMoneyness / 2);
      estimatedPremium = intrinsicValue + timeValue;
    } else {
      // OTM
      estimatedPremium = spot * 0.01 * Math.exp(-absMoneyness / 1.5);
    }
    
    return Math.max(estimatedPremium, 10); // Minimum 10 rupees
  };

  const fetchLivePremium = async (strike, type) => {
    try {
      const response = await axios.get(`/api/options/premium/${strike}/${type}`);
      if (response.data.success) {
        const data = response.data.data;
        setPremium(data.premium.toString());
        toast.success(`Live premium fetched: ₹${data.premium.toFixed(2)}`);
        return data;
      }
    } catch (error) {
      console.error('Error fetching live premium:', error);
      // Fallback to estimation
      const estimated = estimatePremium(parseFloat(strike), niftyPrice.price, type);
      setPremium(estimated.toFixed(2));
      toast.warning(`Using estimated premium: ₹${estimated.toFixed(2)}`);
    }
  };

  const handleStrikeChange = (strike) => {
    setSelectedStrike(strike);
    if (niftyPrice && strike) {
      fetchLivePremium(strike, optionType);
    }
  };

  const handleOptionTypeChange = (type) => {
    setOptionType(type);
    if (niftyPrice && selectedStrike) {
      fetchLivePremium(selectedStrike, type);
    }
  };

  const analyzeOption = () => {
    if (!premium || !selectedStrike || !lotSize) {
      toast.warning('Please enter premium, select strike, and enter lot size');
      return;
    }

    const premiumValue = parseFloat(premium);
    const strike = parseFloat(selectedStrike);
    const lots = parseInt(lotSize);
    const spot = niftyPrice.price;

    // Calculate moneyness
    const moneyness = optionType === 'CE' 
      ? ((spot - strike) / spot * 100)
      : ((strike - spot) / spot * 100);

    const isITM = moneyness > 0;
    const isATM = Math.abs(moneyness) < 0.5;

    // Calculate targets per unit
    const entry = premiumValue;
    const sl = premiumValue * 0.7;
    const target1 = premiumValue * 1.3;
    const target2 = premiumValue * 1.6;
    const target3 = premiumValue * 2.0;

    // Calculate total investment and profits based on lot size
    const totalInvestment = premiumValue * NIFTY_LOT_SIZE * lots;
    const totalSL = sl * NIFTY_LOT_SIZE * lots;
    const totalTarget1 = target1 * NIFTY_LOT_SIZE * lots;
    const totalTarget2 = target2 * NIFTY_LOT_SIZE * lots;
    const totalTarget3 = target3 * NIFTY_LOT_SIZE * lots;

    // Calculate profit/loss amounts
    const lossAmount = totalInvestment - totalSL;
    const profitT1Amount = totalTarget1 - totalInvestment;
    const profitT2Amount = totalTarget2 - totalInvestment;
    const profitT3Amount = totalTarget3 - totalInvestment;

    const rr = ((target1 - entry) / (entry - sl)).toFixed(2);

    // Determine signal strength
    let signalStrength = 'MODERATE';
    let recommendation = 'BUY';

    if (isATM) {
      signalStrength = 'STRONG';
    } else if (Math.abs(moneyness) > 2) {
      signalStrength = 'WEAK';
      recommendation = 'AVOID';
    }

    setAnalysis({
      optionType,
      strike,
      spot: spot.toFixed(2),
      moneyness: moneyness.toFixed(2),
      isITM,
      isATM,
      lots,
      lotSize: NIFTY_LOT_SIZE,
      totalUnits: NIFTY_LOT_SIZE * lots,
      entry: entry.toFixed(2),
      sl: sl.toFixed(2),
      target1: target1.toFixed(2),
      target2: target2.toFixed(2),
      target3: target3.toFixed(2),
      totalInvestment: totalInvestment.toFixed(2),
      totalSL: totalSL.toFixed(2),
      totalTarget1: totalTarget1.toFixed(2),
      totalTarget2: totalTarget2.toFixed(2),
      totalTarget3: totalTarget3.toFixed(2),
      lossAmount: lossAmount.toFixed(2),
      profitT1Amount: profitT1Amount.toFixed(2),
      profitT2Amount: profitT2Amount.toFixed(2),
      profitT3Amount: profitT3Amount.toFixed(2),
      rr,
      signalStrength,
      recommendation,
      profitT1: ((target1 - entry) / entry * 100).toFixed(1),
      profitT2: ((target2 - entry) / entry * 100).toFixed(1),
      profitT3: ((target3 - entry) / entry * 100).toFixed(1)
    });
  };

  if (loading) {
    return (
      <div className="nifty-options-analyzer loading">
        <Loader size={40} className="spinner" />
        <p>Loading NIFTY data...</p>
      </div>
    );
  }

  return (
    <div className="nifty-options-analyzer">
      <div className="analyzer-header">
        <div>
          <h2>📊 NIFTY 50 Options Analyzer</h2>
          <p>Real-time NIFTY options analysis with strike selection</p>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {niftyPrice && (
        <div className="nifty-spot-info">
          <div className="spot-price">
            <span className="label">NIFTY 50 Spot</span>
            <span className="price">₹{niftyPrice.price.toFixed(2)}</span>
          </div>
          <div className={`price-change ${niftyPrice.change >= 0 ? 'positive' : 'negative'}`}>
            <span>{niftyPrice.change >= 0 ? '▲' : '▼'} {Math.abs(niftyPrice.change).toFixed(2)}</span>
            <span>({niftyPrice.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      )}

      <div className="options-input-section">
        <div className="lot-info-banner">
          <span>📦 NIFTY 50 Lot Size: {NIFTY_LOT_SIZE} units</span>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label>Option Type</label>
            <select value={optionType} onChange={(e) => handleOptionTypeChange(e.target.value)}>
              <option value="CE">Call (CE)</option>
              <option value="PE">Put (PE)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Strike Price</label>
            <select value={selectedStrike} onChange={(e) => handleStrikeChange(e.target.value)}>
              {getStrikeOptions().map(strike => {
                const diff = strike - niftyPrice.price;
                const label = diff === 0 ? 'ATM' : diff > 0 ? `OTM +${diff}` : `ITM ${diff}`;
                return (
                  <option key={strike} value={strike}>
                    {strike} ({label})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="input-group">
            <label>Premium per Unit (₹) <span className="auto-label">🔴 Live Market</span></label>
            <input 
              type="number" 
              value={premium} 
              onChange={(e) => setPremium(e.target.value)} 
              placeholder="e.g., 150"
            />
            <span className="input-hint">Live premium • Adjust if needed</span>
          </div>

          <div className="input-group">
            <label>Number of Lots</label>
            <input 
              type="number" 
              value={lotSize} 
              onChange={(e) => setLotSize(e.target.value)} 
              placeholder="e.g., 1"
              min="1"
            />
            <span className="input-hint">Total: {lotSize ? parseInt(lotSize) * NIFTY_LOT_SIZE : 0} units</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="estimate-btn" 
            onClick={() => handleStrikeChange(selectedStrike)}
            disabled={!selectedStrike}
          >
            🔄 Re-estimate Premium
          </button>
          <button className="analyze-btn" onClick={analyzeOption}>
            🎯 Analyze NIFTY Option
          </button>
        </div>
      </div>

      {analysis && (
        <div className="analysis-results">
          <div className="option-details-card">
            <div className="option-header">
              <h3>
                {analysis.optionType === 'CE' ? '📈' : '📉'} 
                NIFTY {analysis.strike} {analysis.optionType}
              </h3>
              <div className="badges">
                <span className={`badge ${analysis.isATM ? 'atm' : analysis.isITM ? 'itm' : 'otm'}`}>
                  {analysis.isATM ? 'ATM' : analysis.isITM ? 'ITM' : 'OTM'}
                </span>
                <span className={`badge ${analysis.signalStrength.toLowerCase()}`}>
                  {analysis.signalStrength}
                </span>
                <span className={`badge ${analysis.recommendation === 'BUY' ? 'buy' : 'avoid'}`}>
                  {analysis.recommendation}
                </span>
              </div>
            </div>

            <div className="investment-summary">
              <h4>💰 Investment Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Lots:</span>
                  <span className="value">{analysis.lots} lot(s)</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Units:</span>
                  <span className="value">{analysis.totalUnits}</span>
                </div>
                <div className="summary-item highlight">
                  <span className="label">Total Investment:</span>
                  <span className="value">₹{parseFloat(analysis.totalInvestment).toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Premium/Unit:</span>
                  <span className="value">₹{analysis.entry}</span>
                </div>
              </div>
            </div>

            <div className="moneyness-info">
              <div className="info-item">
                <span className="label">Spot Price:</span>
                <span className="value">₹{analysis.spot}</span>
              </div>
              <div className="info-item">
                <span className="label">Strike:</span>
                <span className="value">₹{analysis.strike}</span>
              </div>
              <div className="info-item">
                <span className="label">Moneyness:</span>
                <span className={`value ${analysis.moneyness > 0 ? 'positive' : 'negative'}`}>
                  {analysis.moneyness}%
                </span>
              </div>
            </div>

            <div className="targets-section">
              <div className="target-box sl">
                <AlertCircle size={20} />
                <div className="target-info">
                  <span className="target-label">Stop Loss</span>
                  <span className="target-value">₹{analysis.sl}/unit</span>
                  <span className="target-total">Total: ₹{parseFloat(analysis.totalSL).toLocaleString('en-IN')}</span>
                  <span className="target-percent loss">Loss: ₹{parseFloat(analysis.lossAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="target-box t1">
                <Target size={20} />
                <div className="target-info">
                  <span className="target-label">Target 1 (+{analysis.profitT1}%)</span>
                  <span className="target-value">₹{analysis.target1}/unit</span>
                  <span className="target-total">Total: ₹{parseFloat(analysis.totalTarget1).toLocaleString('en-IN')}</span>
                  <span className="target-percent profit">Profit: ₹{parseFloat(analysis.profitT1Amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="target-box t2">
                <Target size={20} />
                <div className="target-info">
                  <span className="target-label">Target 2 (+{analysis.profitT2}%)</span>
                  <span className="target-value">₹{analysis.target2}/unit</span>
                  <span className="target-total">Total: ₹{parseFloat(analysis.totalTarget2).toLocaleString('en-IN')}</span>
                  <span className="target-percent profit">Profit: ₹{parseFloat(analysis.profitT2Amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="target-box t3">
                <Target size={20} />
                <div className="target-info">
                  <span className="target-label">Target 3 (+{analysis.profitT3}%)</span>
                  <span className="target-value">₹{analysis.target3}/unit</span>
                  <span className="target-total">Total: ₹{parseFloat(analysis.totalTarget3).toLocaleString('en-IN')}</span>
                  <span className="target-percent profit">Profit: ₹{parseFloat(analysis.profitT3Amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="target-box rr">
                <TrendingUp size={20} />
                <div className="target-info">
                  <span className="target-label">Risk:Reward Ratio</span>
                  <span className="target-value">1:{analysis.rr}</span>
                </div>
              </div>
            </div>

            <div className="trading-notes">
              <h4>💡 NIFTY Options Trading Tips:</h4>
              <ul>
                <li>ATM options have highest liquidity and best risk-reward</li>
                <li>Monitor NIFTY futures for trend confirmation</li>
                <li>Exit before expiry to avoid time decay</li>
                <li>Use strict stop loss - options can go to zero</li>
                <li>Book partial profits at each target level</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NiftyOptionsAnalyzer;
