import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './components/Dashboard';
import SignalCard from './components/SignalCard';
import ChartView from './components/ChartView';
import Watchlist from './components/Watchlist';
import RiskManager from './components/RiskManager';
import IndexDashboard from './components/IndexDashboard';
import Nifty50List from './components/Nifty50List';
import UniversalStockSearch from './components/UniversalStockSearch';
import TopSignals from './components/TopSignals';
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
          <IndexDashboard />
          <UniversalStockSearch onStockAnalyzed={setIndianStockSignal} />
          {indianStockSignal && (
            <div className="indian-signal-display">
              <h3>📊 Analysis Result</h3>
              <div className="signal-details">
                <div className="signal-header">
                  <h2>{indianStockSignal.name}</h2>
                  <span className={`action-badge ${indianStockSignal.action.toLowerCase()}`}>
                    {indianStockSignal.action}
                  </span>
                  <span className="confidence-badge">{indianStockSignal.confidence}%</span>
                </div>
                <div className="price-targets">
                  <div className="target-item">
                    <span className="label">Entry:</span>
                    <span className="value">₹{indianStockSignal.entry}</span>
                  </div>
                  <div className="target-item">
                    <span className="label">Stop Loss:</span>
                    <span className="value">₹{indianStockSignal.stopLoss}</span>
                  </div>
                  <div className="target-item">
                    <span className="label">Target 1:</span>
                    <span className="value">₹{indianStockSignal.target1}</span>
                  </div>
                  <div className="target-item">
                    <span className="label">Target 2:</span>
                    <span className="value">₹{indianStockSignal.target2}</span>
                  </div>
                  <div className="target-item">
                    <span className="label">Target 3:</span>
                    <span className="value">₹{indianStockSignal.target3}</span>
                  </div>
                </div>
                <div className="signal-reason">
                  <strong>Reason:</strong> {indianStockSignal.reason}
                </div>
              </div>
            </div>
          )}
          <TopSignals />
          <Nifty50List />
        </div>
      )}

      <ToastContainer theme="dark" />
    </div>
  );
}

export default App;
