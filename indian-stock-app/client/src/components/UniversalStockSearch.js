import React, { useState } from 'react';
import axios from 'axios';
import { Search, TrendingUp, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import NiftyOptionsAnalyzer from './NiftyOptionsAnalyzer';
import './UniversalStockSearch.css';

function UniversalStockSearch({ onStockAnalyzed }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showNiftyAnalyzer, setShowNiftyAnalyzer] = useState(false);

  // Common NSE/BSE stock suffixes
  const getStockSymbol = (query) => {
    const upperQuery = query.toUpperCase().trim();
    
    // If already has .NS or .BO, return as is
    if (upperQuery.endsWith('.NS') || upperQuery.endsWith('.BO')) {
      return upperQuery;
    }
    
    // Default to NSE (.NS)
    return `${upperQuery}.NS`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.warning('Please enter a stock symbol');
      return;
    }

    // Check if searching for NIFTY
    const query = searchQuery.toUpperCase().trim();
    if (query === 'NIFTY' || query === 'NIFTY50' || query === 'NIFTY-50' || query === 'NIFTY 50') {
      setShowNiftyAnalyzer(true);
      toast.success('Opening NIFTY 50 Options Analyzer');
      return;
    }

    setLoading(true);
    
    try {
      const symbol = getStockSymbol(searchQuery);
      
      // First, try to get the stock price to verify it exists
      const priceResponse = await axios.get(`/api/stock/price/${symbol}`);
      
      if (priceResponse.data.success) {
        const stockData = priceResponse.data.data;
        
        // Now analyze the stock
        const signalResponse = await axios.post('/api/stock/signal', {
          symbol: symbol,
          name: searchQuery.toUpperCase(),
          sector: 'Custom'
        });
        
        if (signalResponse.data.success) {
          toast.success(`Analysis complete for ${searchQuery.toUpperCase()}`);
          onStockAnalyzed(signalResponse.data.data);
        } else {
          toast.info(signalResponse.data.message || 'No strong signal detected. HOLD recommended.');
          onStockAnalyzed(null);
        }
      }
    } catch (error) {
      if (error.response?.status === 404 || error.message.includes('Not Found')) {
        toast.error(`Stock "${searchQuery.toUpperCase()}" not found. Try with .NS or .BO suffix (e.g., INFY.NS)`);
      } else {
        toast.error('Error analyzing stock. Please check the symbol and try again.');
      }
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularStocks = [
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel' },
    { symbol: 'TATAPOWER.NS', name: 'Tata Power' },
    { symbol: 'TITAN.NS', name: 'Titan' },
    { symbol: 'TRENT.NS', name: 'Trent' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'WIPRO.NS', name: 'Wipro' },
    { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
    { symbol: 'ADANIGREEN.NS', name: 'Adani Green' },
    { symbol: 'ADANIPORTS.NS', name: 'Adani Ports' },
    { symbol: 'ZOMATO.NS', name: 'Zomato' },
    { symbol: 'PAYTM.NS', name: 'Paytm' },
    { symbol: 'IRCTC.NS', name: 'IRCTC' },
    { symbol: 'RELIANCE.NS', name: 'Reliance' }
  ];

  const quickAnalyze = async (stock) => {
    setSearchQuery(stock.symbol);
    setLoading(true);
    
    try {
      const signalResponse = await axios.post('/api/stock/signal', {
        symbol: stock.symbol,
        name: stock.name,
        sector: 'Popular'
      });
      
      if (signalResponse.data.success) {
        toast.success(`Analysis complete for ${stock.name}`);
        onStockAnalyzed(signalResponse.data.data);
      } else {
        toast.info('No strong signal detected. HOLD recommended.');
        onStockAnalyzed(null);
      }
    } catch (error) {
      toast.error('Error analyzing stock');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="universal-stock-search">
      {showNiftyAnalyzer && (
        <NiftyOptionsAnalyzer onClose={() => setShowNiftyAnalyzer(false)} />
      )}
      
      <div className="search-header">
        <h3>🔍 Search Any Stock or NIFTY Options</h3>
        <p className="search-subtitle">Analyze stocks or search "NIFTY" for options analysis</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Enter stock symbol or type NIFTY for options (e.g., INFY, TCS, NIFTY)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
            className="search-input"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="search-button"
          >
            {loading ? <Loader size={20} className="spinner" /> : <TrendingUp size={20} />}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      <div className="search-tips">
        <p className="tip-title">💡 Search Tips:</p>
        <ul>
          <li>Type <code>NIFTY</code> or <code>NIFTY50</code> for NIFTY options analysis</li>
          <li>Enter stock symbol without suffix (e.g., <code>INFY</code>)</li>
          <li>Or with NSE suffix (e.g., <code>INFY.NS</code>)</li>
          <li>Or with BSE suffix (e.g., <code>INFY.BO</code>)</li>
          <li>Default is NSE (.NS) if no suffix provided</li>
        </ul>
      </div>

      <div className="popular-stocks">
        <h4>⚡ Quick Analyze - Popular Stocks & NIFTY</h4>
        <button
          className="popular-stock-btn nifty-btn"
          onClick={() => setShowNiftyAnalyzer(true)}
          disabled={loading}
        >
          <span className="stock-symbol">NIFTY 50</span>
          <span className="stock-name">Options Analyzer</span>
        </button>
        <div className="popular-grid">
          {popularStocks.map((stock, idx) => (
            <button
              key={idx}
              className="popular-stock-btn"
              onClick={() => quickAnalyze(stock)}
              disabled={loading}
            >
              <span className="stock-symbol">{stock.symbol.replace('.NS', '')}</span>
              <span className="stock-name">{stock.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="examples">
        <h4>📋 Example Searches - Tata Group & More:</h4>
        <div className="example-tags">
          <span className="example-tag" onClick={() => setSearchQuery('TCS')}>TCS</span>
          <span className="example-tag" onClick={() => setSearchQuery('TATAMOTORS')}>TATAMOTORS</span>
          <span className="example-tag" onClick={() => setSearchQuery('TATASTEEL')}>TATASTEEL</span>
          <span className="example-tag" onClick={() => setSearchQuery('TATAPOWER')}>TATAPOWER</span>
          <span className="example-tag" onClick={() => setSearchQuery('TITAN')}>TITAN</span>
          <span className="example-tag" onClick={() => setSearchQuery('TRENT')}>TRENT</span>
          <span className="example-tag" onClick={() => setSearchQuery('RELIANCE')}>RELIANCE</span>
          <span className="example-tag" onClick={() => setSearchQuery('BAJAJ-AUTO')}>BAJAJ-AUTO</span>
        </div>
      </div>
    </div>
  );
}

export default UniversalStockSearch;
