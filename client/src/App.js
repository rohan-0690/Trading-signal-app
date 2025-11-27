import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './components/Dashboard';
import SignalCard from './components/SignalCard';
import ChartView from './components/ChartView';
import Watchlist from './components/Watchlist';
import RiskManager from './components/RiskManager';
import IndexDashboard from './components/IndexDashboard';
import UniversalStockSearch from './components/UniversalStockSearch';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('crypto'); // 'crypto' or 'indian-stocks'
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [signals, setSignals] = useState([]);
  const [indianStockSignal, setIndianStockSignal] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:5000');
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      websocket.send(JSON.stringify({
        type: 'subscribe',
        symbol: activeSymbol,
        timeframe: '5m'
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'signal') {
        setSignals(prev => [data.data, ...prev.slice(0, 9)]);
        toast.success(`New ${data.data.signal} signal for ${data.data.symbol}!`, {
          position: 'top-right',
          autoClose: 5000
        });
      }
    };

    return () => websocket.close();
  }, [activeSymbol]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>📈 Trading Signal Pro</h1>
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            🪙 Crypto
          </button>
          <button 
            className={`tab-btn ${activeTab === 'indian-stocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('indian-stocks')}
          >
            🇮🇳 Indian Stocks
          </button>
        </div>
        <div className="header-info">
          <span className="live-indicator">🟢 Live</span>
        </div>
      </header>

      {activeTab === 'crypto' ? (
        <div className="app-container">
          <Dashboard symbol={activeSymbol} />
          <div className="main-content">
            <ChartView symbol={activeSymbol} />
            <div className="signals-grid">
              {signals.map((signal, idx) => (
                <SignalCard key={idx} signal={signal} />
              ))}
            </div>
          </div>
          <aside className="sidebar">
            <Watchlist onSymbolSelect={setActiveSymbol} activeSymbol={activeSymbol} />
            <RiskManager />
          </aside>
        </div>
      ) : (
        <div className="indian-stocks-container">
          <div className="indian-stocks-welcome">
            <h2>🇮🇳 Indian Stock Market Analysis</h2>
            <p>Search and analyze Nifty 50 stocks, NSE/BSE stocks, and NIFTY options</p>
          </div>
          
          <IndexDashboard />
          <UniversalStockSearch onStockAnalyzed={setIndianStockSignal} />
          
          {indianStockSignal && (
            <div className="indian-signal-display">
              <h3>📊 Analysis Result</h3>
              <div className="signal-details">
                <div className="signal-header">
                  <h2>{String(indianStockSignal.name || indianStockSignal.symbol || 'Stock')}</h2>
                  <span className={`action-badge ${String(indianStockSignal.action || 'hold').toLowerCase()}`}>
                    {String(indianStockSignal.action || 'HOLD')}
                  </span>
                  <span className="confidence-badge">{Number(indianStockSignal.confidence || 50)}% Confidence</span>
                </div>
                
                <div className="signal-meta">
                  <div className="meta-item">
                    <span className="meta-label">Sector:</span>
                    <span className="meta-value">{indianStockSignal.sector || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Timeframe:</span>
                    <span className="meta-value">{indianStockSignal.timeframe || '5m'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Risk:Reward:</span>
                    <span className="meta-value">{indianStockSignal.riskReward || 'N/A'}</span>
                  </div>
                  {indianStockSignal.duration && (
                    <div className="meta-item">
                      <span className="meta-label">Duration:</span>
                      <span className="meta-value">{indianStockSignal.duration}</span>
                    </div>
                  )}
                </div>

                <div className="price-targets">
                  <div className="target-item entry">
                    <span className="label">Entry Price</span>
                    <span className="value">
                      ₹{typeof indianStockSignal.entry === 'number' 
                        ? indianStockSignal.entry.toFixed(2) 
                        : (indianStockSignal.targets && indianStockSignal.targets[0] 
                          ? indianStockSignal.targets[0].toFixed(2) 
                          : 'N/A')}
                    </span>
                  </div>
                  <div className="target-item sl">
                    <span className="label">Stop Loss</span>
                    <span className="value">
                      ₹{typeof indianStockSignal.stopLoss === 'number' 
                        ? indianStockSignal.stopLoss.toFixed(2) 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="target-item t1">
                    <span className="label">Target 1</span>
                    <span className="value">
                      ₹{indianStockSignal.targets && indianStockSignal.targets[0]
                        ? indianStockSignal.targets[0].toFixed(2)
                        : (typeof indianStockSignal.target1 === 'number' 
                          ? indianStockSignal.target1.toFixed(2) 
                          : 'N/A')}
                    </span>
                  </div>
                  <div className="target-item t2">
                    <span className="label">Target 2</span>
                    <span className="value">
                      ₹{indianStockSignal.targets && indianStockSignal.targets[1]
                        ? indianStockSignal.targets[1].toFixed(2)
                        : (typeof indianStockSignal.target2 === 'number' 
                          ? indianStockSignal.target2.toFixed(2) 
                          : 'N/A')}
                    </span>
                  </div>
                  <div className="target-item t3">
                    <span className="label">Target 3</span>
                    <span className="value">
                      ₹{indianStockSignal.targets && indianStockSignal.targets[2]
                        ? indianStockSignal.targets[2].toFixed(2)
                        : (typeof indianStockSignal.target3 === 'number' 
                          ? indianStockSignal.target3.toFixed(2) 
                          : 'N/A')}
                    </span>
                  </div>
                </div>

                {indianStockSignal.patterns && indianStockSignal.patterns.length > 0 && (
                  <div className="patterns-detected">
                    <h4>📈 Patterns Detected:</h4>
                    <div className="pattern-tags">
                      {indianStockSignal.patterns.map((pattern, idx) => (
                        <span key={idx} className="pattern-tag">{pattern}</span>
                      ))}
                    </div>
                  </div>
                )}

                {indianStockSignal.indicators && typeof indianStockSignal.indicators === 'object' && (
                  <div className="indicators-info">
                    <h4>📊 Technical Indicators:</h4>
                    <div className="indicators-grid">
                      {typeof indianStockSignal.indicators.rsi === 'number' && (
                        <div className="indicator-item">
                          <span className="indicator-label">RSI:</span>
                          <span className="indicator-value">{indianStockSignal.indicators.rsi.toFixed(2)}</span>
                        </div>
                      )}
                      {indianStockSignal.indicators.macd && typeof indianStockSignal.indicators.macd === 'object' && (
                        <div className="indicator-item">
                          <span className="indicator-label">MACD:</span>
                          <span className="indicator-value">
                            {typeof indianStockSignal.indicators.macd.histogram === 'number' 
                              ? indianStockSignal.indicators.macd.histogram.toFixed(2) 
                              : 'N/A'}
                          </span>
                        </div>
                      )}
                      {indianStockSignal.indicators.ema && typeof indianStockSignal.indicators.ema === 'object' && (
                        <>
                          {typeof indianStockSignal.indicators.ema.ema20 === 'number' && (
                            <div className="indicator-item">
                              <span className="indicator-label">EMA 20:</span>
                              <span className="indicator-value">₹{indianStockSignal.indicators.ema.ema20.toFixed(2)}</span>
                            </div>
                          )}
                          {typeof indianStockSignal.indicators.ema.ema50 === 'number' && (
                            <div className="indicator-item">
                              <span className="indicator-label">EMA 50:</span>
                              <span className="indicator-value">₹{indianStockSignal.indicators.ema.ema50.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="signal-reason">
                  <strong>📝 Analysis:</strong> {indianStockSignal.reason || 'Technical analysis based on patterns and indicators'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ToastContainer theme="dark" />
    </div>
  );
}

export default App;
