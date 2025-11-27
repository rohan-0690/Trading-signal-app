import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SimpleIndianStocks.css';

function SimpleIndianStocks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    const symbol = searchQuery.toUpperCase().includes('.NS') 
      ? searchQuery.toUpperCase() 
      : `${searchQuery.toUpperCase()}.NS`;

    try {
      const response = await axios.post('/api/stock/signal', {
        symbol: symbol,
        name: searchQuery.toUpperCase(),
        sector: 'Custom'
      });

      if (response.data && response.data.data) {
        setResult(response.data.data);
        toast.success('Analysis complete!');
      } else {
        toast.info('No strong signal detected');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error analyzing stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-indian-stocks">
      <div className="search-section">
        <h2>🇮🇳 Indian Stock Analysis</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., TCS, INFY, RELIANCE)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>

      {result && (
        <div className="result-section">
          <h3>Analysis Result</h3>
          <div className="result-card">
            <div className="result-header">
              <h2>{result.name || result.symbol}</h2>
              <span className={`badge ${result.action}`}>{result.action}</span>
              <span className="confidence">{result.confidence}%</span>
            </div>
            
            <div className="targets">
              <div className="target-box">
                <span>Entry</span>
                <strong>₹{result.entry ? result.entry.toFixed(2) : 'N/A'}</strong>
              </div>
              <div className="target-box">
                <span>Stop Loss</span>
                <strong>₹{result.stopLoss ? result.stopLoss.toFixed(2) : 'N/A'}</strong>
              </div>
              {result.targets && result.targets.map((target, idx) => (
                <div key={idx} className="target-box">
                  <span>Target {idx + 1}</span>
                  <strong>₹{target.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {result.reason && (
              <div className="reason">
                <strong>Analysis:</strong> {result.reason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleIndianStocks;
