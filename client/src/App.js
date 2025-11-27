import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './components/Dashboard';
import SignalCard from './components/SignalCard';
import ChartView from './components/ChartView';
import Watchlist from './components/Watchlist';
import RiskManager from './components/RiskManager';
import './App.css';

function App() {
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [signals, setSignals] = useState([]);

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
        <div className="header-info">
          <span className="live-indicator">🟢 Live</span>
        </div>
      </header>

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

      <ToastContainer theme="dark" />
    </div>
  );
}

export default App;
