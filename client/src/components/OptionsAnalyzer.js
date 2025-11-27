import React, { useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, AlertCircle, Target, Shield, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import './OptionsAnalyzer.css';

function OptionsAnalyzer() {
  const [mode, setMode] = useState('simple'); // 'simple' or 'advanced'
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'stock'
  const [optionType, setOptionType] = useState('CE'); // 'CE' or 'PE'
  const [premium, setPremium] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' or 'SELL'
  const [loading, setLoading] = useState(false);
  const [fetchedPrice, setFetchedPrice] = useState(null);
  
  // Advanced mode fields
  const [niftySpot, setNiftySpot] = useState('');
  const [callStrike, setCallStrike] = useState('');
  const [putStrike, setPutStrike] = useState('');
  const [callPremium, setCallPremium] = useState('');
  const [putPremium, setPutPremium] = useState('');
  const [callOI, setCallOI] = useState('');
  const [putOI, setPutOI] = useState('');
  const [callVolume, setCallVolume] = useState('');
  const [putVolume, setPutVolume] = useState('');
  const [callOIChange, setCallOIChange] = useState('');
  const [putOIChange, setPutOIChange] = useState('');
  
  const [analysis, setAnalysis] = useState(null);

  const fetchStockPrice = async () => {
    if (!stockSymbol.trim()) {
      toast.warning('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    try {
      const symbol = stockSymbol.toUpperCase().endsWith('.NS') || stockSymbol.toUpperCase().endsWith('.BO') 
        ? stockSymbol.toUpperCase() 
        : `${stockSymbol.toUpperCase()}.NS`;
      
      const response = await axios.get(`/api/stock/price/${symbol}`);
      
      if (response.data.success) {
        const price = response.data.data.price;
        setFetchedPrice(price);
        setPremium(price.toString());
        toast.success(`Fetched ${stockSymbol.toUpperCase()}: ₹${price.toFixed(2)}`);
      }
    } catch (error) {
      toast.error(`Could not fetch price for ${stockSymbol.toUpperCase()}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSimple = () => {
    const premiumValue = parseFloat(premium);
    
    if (!premiumValue || premiumValue <= 0) {
      toast.warning('Please enter a valid premium price');
      return;
    }

    let entry, sl, target1, target2, target3;

    if (tradeType === 'BUY') {
      entry = premiumValue;
      sl = premiumValue * 0.7; // 30% stop loss
      target1 = premiumValue * 1.3; // 30% profit
      target2 = premiumValue * 1.6; // 60% profit
      target3 = premiumValue * 2.0; // 100% profit
    } else { // SELL
      entry = premiumValue;
      sl = premiumValue * 1.3; // 30% stop loss
      target1 = premiumValue * 0.7; // 30% profit
      target2 = premiumValue * 0.5; // 50% profit
      target3 = premiumValue * 0.3; // 70% profit
    }

    const rr = tradeType === 'BUY' ? 
      ((target1 - entry) / (entry - sl)).toFixed(2) :
      ((entry - target1) / (sl - entry)).toFixed(2);

    // Calculate holding period based on profit target
    const profitPercent = Math.abs(((target1 - entry) / entry * 100));
    let holdingPeriod, tradingStyle;
    
    if (profitPercent < 20) {
      holdingPeriod = '15-30 minutes';
      tradingStyle = 'Scalping';
    } else if (profitPercent < 40) {
      holdingPeriod = '30 minutes - 1 hour';
      tradingStyle = 'Intraday';
    } else if (profitPercent < 60) {
      holdingPeriod = '1-2 hours';
      tradingStyle = 'Intraday';
    } else {
      holdingPeriod = '2-4 hours';
      tradingStyle = 'Swing';
    }

    setAnalysis({
      simple: true,
      optionType,
      tradeType,
      signal: `${tradeType} ${optionType}`,
      stockSymbol: inputMode === 'stock' ? stockSymbol.toUpperCase() : null,
      entry: entry.toFixed(2),
      sl: sl.toFixed(2),
      target1: target1.toFixed(2),
      target2: target2.toFixed(2),
      target3: target3.toFixed(2),
      rr: rr,
      profitT1: ((target1 - entry) / entry * 100).toFixed(1),
      profitT2: ((target2 - entry) / entry * 100).toFixed(1),
      profitT3: ((target3 - entry) / entry * 100).toFixed(1),
      holdingPeriod,
      tradingStyle
    });
  };

  const analyzeOptions = () => {
    const spot = parseFloat(niftySpot);
    const ceStrike = parseFloat(callStrike);
    const peStrike = parseFloat(putStrike);
    const cePremium = parseFloat(callPremium);
    const pePremium = parseFloat(putPremium);
    const ceOI = parseFloat(callOI);
    const peOI = parseFloat(putOI);
    const ceVol = parseFloat(callVolume);
    const peVol = parseFloat(putVolume);
    const ceOIChg = parseFloat(callOIChange);
    const peOIChg = parseFloat(putOIChange);

    // Calculate PCR (Put-Call Ratio)
    const pcrOI = peOI / ceOI;
    const pcrVolume = peVol / ceVol;

    // Determine market direction
    let marketDirection = 'SIDEWAYS';
    let directionScore = 0;

    if (pcrOI > 1.3 && ceOIChg < 0) {
      marketDirection = 'BULLISH';
      directionScore = 75;
    } else if (pcrOI < 0.7 && peOIChg < 0) {
      marketDirection = 'BEARISH';
      directionScore = 75;
    } else if (ceOIChg > 20 && peOIChg < 10) {
      marketDirection = 'BEARISH';
      directionScore = 70;
    } else if (peOIChg > 20 && ceOIChg < 10) {
      marketDirection = 'BULLISH';
      directionScore = 70;
    }

    // Call Analysis
    const ceMoneyness = ((spot - ceStrike) / spot) * 100;
    const ceSignal = ceOIChg < -10 && ceVol > ceOI * 0.3 ? 'BUY CE' : 
                     ceOIChg > 20 && ceVol > ceOI * 0.5 ? 'SELL CE' : 'HOLD CE';
    
    const ceEntry = cePremium;
    const ceSL = ceSignal === 'BUY CE' ? cePremium * 0.7 : cePremium * 1.3;
    const ceTarget1 = ceSignal === 'BUY CE' ? cePremium * 1.3 : cePremium * 0.7;
    const ceTarget2 = ceSignal === 'BUY CE' ? cePremium * 1.6 : cePremium * 0.5;
    const ceTarget3 = ceSignal === 'BUY CE' ? cePremium * 2.0 : cePremium * 0.3;

    // Put Analysis
    const peMoneyness = ((peStrike - spot) / spot) * 100;
    const peSignal = peOIChg < -10 && peVol > peOI * 0.3 ? 'BUY PE' :
                     peOIChg > 20 && peVol > peOI * 0.5 ? 'SELL PE' : 'HOLD PE';
    
    const peEntry = pePremium;
    const peSL = peSignal === 'BUY PE' ? pePremium * 0.7 : pePremium * 1.3;
    const peTarget1 = peSignal === 'BUY PE' ? pePremium * 1.3 : pePremium * 0.7;
    const peTarget2 = peSignal === 'BUY PE' ? pePremium * 1.6 : pePremium * 0.5;
    const peTarget3 = peSignal === 'BUY PE' ? pePremium * 2.0 : pePremium * 0.3;

    // Risk-Reward
    const ceRR = ceSignal === 'BUY CE' ? 
      ((ceTarget1 - ceEntry) / (ceEntry - ceSL)).toFixed(2) :
      ((ceEntry - ceTarget1) / (ceSL - ceEntry)).toFixed(2);
    
    const peRR = peSignal === 'BUY PE' ?
      ((peTarget1 - peEntry) / (peEntry - peSL)).toFixed(2) :
      ((peEntry - peTarget1) / (peSL - peEntry)).toFixed(2);

    // Buyer vs Seller strength
    const ceBuyerStrength = ceOIChg < 0 && ceVol > ceOI * 0.4 ? 'BUYERS STRONG' : 
                           ceOIChg > 15 ? 'SELLERS STRONG' : 'NEUTRAL';
    const peBuyerStrength = peOIChg < 0 && peVol > peOI * 0.4 ? 'BUYERS STRONG' :
                           peOIChg > 15 ? 'SELLERS STRONG' : 'NEUTRAL';

    // Reasons
    const ceReason = `OI Change: ${ceOIChg.toFixed(1)}%, Volume: ${ceVol.toLocaleString()}, ${ceMoneyness > 0 ? 'ITM' : 'OTM'} by ${Math.abs(ceMoneyness).toFixed(2)}%`;
    const peReason = `OI Change: ${peOIChg.toFixed(1)}%, Volume: ${peVol.toLocaleString()}, ${peMoneyness > 0 ? 'ITM' : 'OTM'} by ${Math.abs(peMoneyness).toFixed(2)}%`;

    // Avoid trade conditions
    const ceAvoid = Math.abs(ceOIChg) < 5 && ceVol < ceOI * 0.2 ? 'Low activity, avoid' : '';
    const peAvoid = Math.abs(peOIChg) < 5 && peVol < peOI * 0.2 ? 'Low activity, avoid' : '';

    setAnalysis({
      marketDirection,
      directionScore,
      pcrOI: pcrOI.toFixed(2),
      pcrVolume: pcrVolume.toFixed(2),
      call: {
        signal: ceSignal,
        entry: ceEntry.toFixed(2),
        sl: ceSL.toFixed(2),
        target1: ceTarget1.toFixed(2),
        target2: ceTarget2.toFixed(2),
        target3: ceTarget3.toFixed(2),
        rr: ceRR,
        strength: ceBuyerStrength,
        reason: ceReason,
        avoid: ceAvoid
      },
      put: {
        signal: peSignal,
        entry: peEntry.toFixed(2),
        sl: peSL.toFixed(2),
        target1: peTarget1.toFixed(2),
        target2: peTarget2.toFixed(2),
        target3: peTarget3.toFixed(2),
        rr: peRR,
        strength: peBuyerStrength,
        reason: peReason,
        avoid: peAvoid
      }
    });
  };

  return (
    <div className="options-analyzer">
      <div className="analyzer-header">
        <h2>📊 NIFTY Options Analyzer</h2>
        <p>Quick Target Calculator & Advanced Options Analysis</p>
        
        <div className="mode-toggle">
          <button 
            className={mode === 'simple' ? 'active' : ''} 
            onClick={() => setMode('simple')}
          >
            🎯 Quick Targets
          </button>
          <button 
            className={mode === 'advanced' ? 'active' : ''} 
            onClick={() => setMode('advanced')}
          >
            📊 Advanced Analysis
          </button>
        </div>
      </div>

      {mode === 'simple' ? (
        <div className="input-section simple-mode">
          <div className="simple-inputs">
            <div className="input-mode-toggle">
              <button 
                className={inputMode === 'manual' ? 'active' : ''} 
                onClick={() => setInputMode('manual')}
              >
                ✍️ Manual Entry
              </button>
              <button 
                className={inputMode === 'stock' ? 'active' : ''} 
                onClick={() => setInputMode('stock')}
              >
                📊 Fetch Stock Price
              </button>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Option Type</label>
                <select value={optionType} onChange={(e) => setOptionType(e.target.value)}>
                  <option value="CE">Call (CE)</option>
                  <option value="PE">Put (PE)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Trade Type</label>
                <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
            </div>

            {inputMode === 'stock' ? (
              <div className="stock-fetch-section">
                <div className="input-group">
                  <label>Stock Symbol</label>
                  <div className="stock-input-wrapper">
                    <input 
                      type="text" 
                      value={stockSymbol} 
                      onChange={(e) => setStockSymbol(e.target.value)} 
                      placeholder="e.g., INFY, TCS, RELIANCE" 
                      disabled={loading}
                    />
                    <button 
                      className="fetch-btn" 
                      onClick={fetchStockPrice}
                      disabled={loading}
                    >
                      {loading ? <Loader size={16} className="spinner" /> : '🔍'}
                      {loading ? 'Fetching...' : 'Fetch Price'}
                    </button>
                  </div>
                </div>
                
                {fetchedPrice && (
                  <div className="fetched-price-display">
                    <span className="price-label">Current Price:</span>
                    <span className="price-value">₹{fetchedPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="input-group">
                <label>Premium Price (₹)</label>
                <input 
                  type="number" 
                  value={premium} 
                  onChange={(e) => setPremium(e.target.value)} 
                  placeholder="e.g., 150" 
                />
              </div>
            )}

            <button 
              className="analyze-btn" 
              onClick={analyzeSimple}
              disabled={!premium || loading}
            >
              🎯 Calculate Targets
            </button>
          </div>
        </div>
      ) : (
        <div className="input-section">
        <div className="input-group">
          <label>NIFTY Spot Price</label>
          <input type="number" value={niftySpot} onChange={(e) => setNiftySpot(e.target.value)} placeholder="e.g., 24500" />
        </div>

        <div className="options-inputs">
          <div className="option-column">
            <h3>📈 Call Option (CE)</h3>
            <input type="number" value={callStrike} onChange={(e) => setCallStrike(e.target.value)} placeholder="Strike Price" />
            <input type="number" value={callPremium} onChange={(e) => setCallPremium(e.target.value)} placeholder="Premium" />
            <input type="number" value={callOI} onChange={(e) => setCallOI(e.target.value)} placeholder="Open Interest" />
            <input type="number" value={callVolume} onChange={(e) => setCallVolume(e.target.value)} placeholder="Volume" />
            <input type="number" value={callOIChange} onChange={(e) => setCallOIChange(e.target.value)} placeholder="OI Change %" />
          </div>

          <div className="option-column">
            <h3>📉 Put Option (PE)</h3>
            <input type="number" value={putStrike} onChange={(e) => setPutStrike(e.target.value)} placeholder="Strike Price" />
            <input type="number" value={putPremium} onChange={(e) => setPutPremium(e.target.value)} placeholder="Premium" />
            <input type="number" value={putOI} onChange={(e) => setPutOI(e.target.value)} placeholder="Open Interest" />
            <input type="number" value={putVolume} onChange={(e) => setPutVolume(e.target.value)} placeholder="Volume" />
            <input type="number" value={putOIChange} onChange={(e) => setPutOIChange(e.target.value)} placeholder="OI Change %" />
          </div>
        </div>

          <button className="analyze-btn" onClick={analyzeOptions}>
            🎯 Analyze Options
          </button>
        </div>
      )}

      {analysis && analysis.simple && (
        <div className="analysis-results simple-results">
          <div className="simple-signal-card">
            <div className="signal-header">
              <h3>
                {optionType === 'CE' ? '📈' : '📉'} {analysis.signal}
                {analysis.stockSymbol && <span className="stock-badge">{analysis.stockSymbol}</span>}
              </h3>
              <span className={`signal-badge ${tradeType === 'BUY' ? 'buy' : 'sell'}`}>
                {analysis.signal}
              </span>
            </div>

            <div className="targets-grid">
              <div className="target-box entry">
                <div className="target-label">Entry Price</div>
                <div className="target-value">₹{analysis.entry}</div>
              </div>

              <div className="target-box sl">
                <div className="target-label">Stop Loss</div>
                <div className="target-value">₹{analysis.sl}</div>
                <div className="target-percent">-30%</div>
              </div>

              <div className="target-box t1">
                <div className="target-label">🎯 Target 1</div>
                <div className="target-value">₹{analysis.target1}</div>
                <div className="target-percent">{tradeType === 'BUY' ? '+' : '-'}{Math.abs(analysis.profitT1)}%</div>
              </div>

              <div className="target-box t2">
                <div className="target-label">🎯 Target 2</div>
                <div className="target-value">₹{analysis.target2}</div>
                <div className="target-percent">{tradeType === 'BUY' ? '+' : '-'}{Math.abs(analysis.profitT2)}%</div>
              </div>

              <div className="target-box t3">
                <div className="target-label">🎯 Target 3</div>
                <div className="target-value">₹{analysis.target3}</div>
                <div className="target-percent">{tradeType === 'BUY' ? '+' : '-'}{Math.abs(analysis.profitT3)}%</div>
              </div>

              <div className="target-box rr">
                <div className="target-label">Risk:Reward</div>
                <div className="target-value">1:{analysis.rr}</div>
              </div>
            </div>

            <div className="holding-period-info">
              <h4>⏱️ Expected Holding Period:</h4>
              <div className="holding-details">
                <div className="holding-item">
                  <span className="holding-label">Trading Style:</span>
                  <span className="holding-value">{analysis.tradingStyle}</span>
                </div>
                <div className="holding-item">
                  <span className="holding-label">Hold Duration:</span>
                  <span className="holding-value highlight">{analysis.holdingPeriod}</span>
                </div>
              </div>
            </div>

            <div className="trade-tips">
              <h4>💡 Trading Tips:</h4>
              <ul>
                <li>Book partial profits at Target 1 (30-40% of position)</li>
                <li>Move SL to entry after Target 1 is hit</li>
                <li>Trail SL as price moves towards Target 2 & 3</li>
                <li>Exit immediately if SL is hit - don't average down</li>
                <li>Monitor time decay (theta) for options near expiry</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {analysis && !analysis.simple && (
        <div className="analysis-results">
          <div className="market-overview">
            <div className={`market-direction ${analysis.marketDirection.toLowerCase()}`}>
              <h3>Market Direction</h3>
              <div className="direction-badge">
                {analysis.marketDirection === 'BULLISH' && <TrendingUp size={32} />}
                {analysis.marketDirection === 'BEARISH' && <TrendingDown size={32} />}
                {analysis.marketDirection === 'SIDEWAYS' && <AlertCircle size={32} />}
                <span>{analysis.marketDirection}</span>
              </div>
              <p>Confidence: {analysis.directionScore}%</p>
            </div>

            <div className="pcr-metrics">
              <div className="pcr-item">
                <label>PCR (OI)</label>
                <span className={analysis.pcrOI > 1.3 ? 'bullish' : analysis.pcrOI < 0.7 ? 'bearish' : ''}>{analysis.pcrOI}</span>
              </div>
              <div className="pcr-item">
                <label>PCR (Volume)</label>
                <span className={analysis.pcrVolume > 1.3 ? 'bullish' : analysis.pcrVolume < 0.7 ? 'bearish' : ''}>{analysis.pcrVolume}</span>
              </div>
            </div>
          </div>

          <div className="signals-container">
            <div className="signal-card call-signal">
              <div className="signal-header">
                <h3>📈 Call Option (CE)</h3>
                <span className={`signal-badge ${analysis.call.signal.includes('BUY') ? 'buy' : analysis.call.signal.includes('SELL') ? 'sell' : 'hold'}`}>
                  {analysis.call.signal}
                </span>
              </div>

              <div className="signal-details">
                <div className="detail-row">
                  <Shield size={16} />
                  <span>Entry: ₹{analysis.call.entry}</span>
                </div>
                <div className="detail-row">
                  <AlertCircle size={16} />
                  <span>Stop Loss: ₹{analysis.call.sl}</span>
                </div>
                <div className="detail-row">
                  <Target size={16} />
                  <span>Target 1: ₹{analysis.call.target1}</span>
                </div>
                <div className="detail-row">
                  <Target size={16} />
                  <span>Target 2: ₹{analysis.call.target2}</span>
                </div>
                <div className="detail-row">
                  <Target size={16} />
                  <span>Target 3: ₹{analysis.call.target3}</span>
                </div>
              </div>

              <div className="signal-metrics">
                <div className="metric">
                  <label>Risk-Reward</label>
                  <span className="value">1:{analysis.call.rr}</span>
                </div>
                <div className="metric">
                  <label>Strength</label>
                  <span className={`value ${analysis.call.strength.includes('BUYERS') ? 'bullish' : analysis.call.strength.includes('SELLERS') ? 'bearish' : ''}`}>
                    {analysis.call.strength}
                  </span>
                </div>
              </div>

              <div className="signal-reason">
                <strong>Reason:</strong> {analysis.call.reason}
              </div>

              {analysis.call.avoid && (
                <div className="avoid-warning">
                  ⚠️ {analysis.call.avoid}
                </div>
              )}
            </div>

            <div className="signal-card put-signal">
              <div className="signal-header">
                <h3>📉 Put Option (PE)</h3>
                <span className={`signal-badge ${analysis.put.signal.includes('BUY') ? 'buy' : analysis.put.signal.includes('SELL') ? 'sell' : 'hold'}`}>
                  {analysis.put.signal}
                </span>
              </div>

              <div className="signal-details">
                <div className="detail-row">
                  <Shield size={16} />
                  <span>Entry: ₹{analysis.put.entry}</span>
                </div>
                <div className="detail-row">
                  <AlertCircle size={16} />
                  <span>Stop Loss: ₹{analysis.put.sl}</span>
                </div>
                <div className="detail-row">
                  <Target size={16} />
                  <span>Target 1: ₹{analysis.put.target1}</span>
                </div>
                <div className="detail-row">
                  <Target size={16} />
                  <span>Target 2: ₹{analysis.put.target2}</span>
                </div>
                <div className="detail-row">
                  <Target size={16} />
                  <span>Target 3: ₹{analysis.put.target3}</span>
                </div>
              </div>

              <div className="signal-metrics">
                <div className="metric">
                  <label>Risk-Reward</label>
                  <span className="value">1:{analysis.put.rr}</span>
                </div>
                <div className="metric">
                  <label>Strength</label>
                  <span className={`value ${analysis.put.strength.includes('BUYERS') ? 'bullish' : analysis.put.strength.includes('SELLERS') ? 'bearish' : ''}`}>
                    {analysis.put.strength}
                  </span>
                </div>
              </div>

              <div className="signal-reason">
                <strong>Reason:</strong> {analysis.put.reason}
              </div>

              {analysis.put.avoid && (
                <div className="avoid-warning">
                  ⚠️ {analysis.put.avoid}
                </div>
              )}
            </div>
          </div>

          <div className="monitoring-alerts">
            <h3>🔔 Key Monitoring Points</h3>
            <ul>
              <li>Watch for unexpected OI spikes (&gt;30% change)</li>
              <li>Monitor rapid premium decay (theta impact)</li>
              <li>Track support/resistance at strike levels</li>
              <li>Check NIFTY futures trend alignment</li>
              <li>Alert on reversal triggers (PCR flip)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default OptionsAnalyzer;
