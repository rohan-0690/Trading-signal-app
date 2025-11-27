import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Navigation from './components/Navigation';
import IndexDashboard from './components/IndexDashboard';
import StockSignalCard from './components/StockSignalCard';
import Nifty50List from './components/Nifty50List';
import TopSignals from './components/TopSignals';
import UniversalStockSearch from './components/UniversalStockSearch';
import OptionsAnalyzer from './components/OptionsAnalyzer';
import CryptoAnalyzer from './components/CryptoAnalyzer';
import NiftyOptionsAnalyzer from './components/NiftyOptionsAnalyzer';
import OptionsChain from './components/OptionsChain';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [signals, setSignals] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'stocks') {
      fetchTopSignals();
      
      // Refresh every 5 minutes
      const interval = setInterval(fetchTopSignals, 300000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchTopSignals = async () => {
    try {
      const response = await axios.get('/api/signals/top');
      if (response.data.success) {
        setSignals(response.data.data);
        if (response.data.data.length > 0) {
          toast.success(`Found ${response.data.data.length} trading opportunities!`);
        }
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  };

  const analyzeStock = async (stock) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/stock/signal', stock);
      if (response.data.success) {
        setSelectedStock(response.data.data);
        toast.success(`Analysis complete for ${stock.name}`);
      } else {
        toast.info(response.data.message || 'No strong signal detected');
        setSelectedStock(null);
      }
    } catch (error) {
      toast.error('Error analyzing stock');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAllNifty50 = async () => {
    setLoading(true);
    toast.info('Analyzing all Nifty 50 stocks... This may take a moment');
    try {
      const response = await axios.get('/api/nifty50/signals');
      if (response.data.success) {
        setSignals(response.data.data);
        toast.success(`Found ${response.data.data.length} trading opportunities in Nifty 50!`);
      } else {
        toast.info('No strong signals found in Nifty 50 stocks');
      }
    } catch (error) {
      toast.error('Error analyzing Nifty 50 stocks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'stocks' && (
        <div className="app-container">
          <aside className="sidebar-left">
            <Nifty50List onStockSelect={analyzeStock} loading={loading} />
          </aside>

          <main className="main-content">
            <IndexDashboard />
            
            <OptionsAnalyzer />
            
            <UniversalStockSearch onStockAnalyzed={setSelectedStock} />
            
            <div className="signals-section">
              <div className="signals-header">
                <h2>🎯 Top Trading Opportunities</h2>
                <button 
                  className="analyze-nifty50-btn"
                  onClick={analyzeAllNifty50}
                  disabled={loading}
                >
                  {loading ? '⏳ Analyzing...' : '📊 Analyze All Nifty 50'}
                </button>
              </div>
              <div className="signals-grid">
                {signals.length === 0 ? (
                  <div className="no-signals">
                    <p>🔍 Analyzing Nifty 50 stocks...</p>
                    <p className="hint">Select a stock from the list or search any stock above</p>
                  </div>
                ) : (
                  signals.map((signal, idx) => (
                    <StockSignalCard key={idx} signal={signal} />
                  ))
                )}
              </div>
            </div>

            {selectedStock && (
              <div className="selected-stock-analysis">
                <h2>📊 Detailed Analysis</h2>
                <StockSignalCard signal={selectedStock} detailed={true} />
              </div>
            )}
          </main>

          <aside className="sidebar-right">
            <TopSignals signals={signals} />
          </aside>
        </div>
      )}

      {activeTab === 'crypto' && (
        <div className="app-container single-column">
          <CryptoAnalyzer />
        </div>
      )}

      {activeTab === 'nifty' && (
        <div className="app-container single-column">
          <NiftyOptionsAnalyzer />
          <OptionsChain />
        </div>
      )}

      <ToastContainer theme="dark" position="top-right" />
    </div>
  );
}

export default App;
