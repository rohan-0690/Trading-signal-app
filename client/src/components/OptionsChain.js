import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import './OptionsChain.css';

function OptionsChain() {
  const [chainData, setChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrike, setSelectedStrike] = useState(null);

  const fetchOptionChain = async () => {
    try {
      const response = await axios.get('/api/options/chain?range=10');
      if (response.data.success) {
        setChainData(response.data.data);
        if (!selectedStrike && response.data.data.chain.length > 0) {
          // Select ATM strike by default
          const atmIndex = Math.floor(response.data.data.chain.length / 2);
          setSelectedStrike(response.data.data.chain[atmIndex].strike);
        }
      }
    } catch (error) {
      toast.error('Error fetching option chain');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptionChain();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOptionChain, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="options-chain loading">
        <Loader size={40} className="spinner" />
        <p>Loading option chain...</p>
      </div>
    );
  }

  if (!chainData) {
    return <div className="options-chain error">Failed to load option chain</div>;
  }

  const getMoneyness = (strike) => {
    const diff = strike - chainData.spotPrice;
    if (Math.abs(diff) < 25) return 'ATM';
    return diff > 0 ? 'OTM' : 'ITM';
  };

  return (
    <div className="options-chain">
      <div className="chain-header">
        <h2>📊 NIFTY Options Chain</h2>
        <div className="chain-info">
          <div className="info-item">
            <span className="label">Spot Price:</span>
            <span className="value">₹{chainData.spotPrice.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="label">Days to Expiry:</span>
            <span className="value">{chainData.daysToExpiry} days</span>
          </div>
          <button className="refresh-btn" onClick={fetchOptionChain}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="chain-table-wrapper">
        <table className="chain-table">
          <thead>
            <tr>
              <th colSpan="4" className="call-header">CALL (CE)</th>
              <th className="strike-header">STRIKE</th>
              <th colSpan="4" className="put-header">PUT (PE)</th>
            </tr>
            <tr>
              <th>OI</th>
              <th>Volume</th>
              <th>Premium</th>
              <th>Delta</th>
              <th>Price</th>
              <th>Delta</th>
              <th>Premium</th>
              <th>Volume</th>
              <th>OI</th>
            </tr>
          </thead>
          <tbody>
            {chainData.chain.map((row, idx) => {
              const moneyness = getMoneyness(row.strike);
              const isSelected = row.strike === selectedStrike;
              const isATM = moneyness === 'ATM';
              
              return (
                <tr 
                  key={idx} 
                  className={`${isATM ? 'atm-row' : ''} ${isSelected ? 'selected-row' : ''}`}
                  onClick={() => setSelectedStrike(row.strike)}
                >
                  <td className="call-data">{(row.call.oi / 1000).toFixed(1)}K</td>
                  <td className="call-data">{(row.call.volume / 1000).toFixed(1)}K</td>
                  <td className="call-data premium">₹{row.call.premium}</td>
                  <td className="call-data">{row.call.greeks.delta}</td>
                  
                  <td className={`strike-cell ${moneyness.toLowerCase()}`}>
                    {row.strike}
                    {isATM && <span className="atm-badge">ATM</span>}
                  </td>
                  
                  <td className="put-data">{row.put.greeks.delta}</td>
                  <td className="put-data premium">₹{row.put.premium}</td>
                  <td className="put-data">{(row.put.volume / 1000).toFixed(1)}K</td>
                  <td className="put-data">{(row.put.oi / 1000).toFixed(1)}K</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedStrike && (
        <div className="selected-strike-info">
          <h3>Selected Strike: {selectedStrike}</h3>
          <div className="strike-details">
            {chainData.chain.find(r => r.strike === selectedStrike) && (
              <>
                <div className="detail-card call-card">
                  <h4><TrendingUp size={20} /> Call Option</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Premium:</span>
                      <span className="value">₹{chainData.chain.find(r => r.strike === selectedStrike).call.premium}</span>
                    </div>
                    <div className="detail-item">
                      <span>Delta:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).call.greeks.delta}</span>
                    </div>
                    <div className="detail-item">
                      <span>Gamma:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).call.greeks.gamma}</span>
                    </div>
                    <div className="detail-item">
                      <span>Theta:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).call.greeks.theta}</span>
                    </div>
                    <div className="detail-item">
                      <span>Vega:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).call.greeks.vega}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-card put-card">
                  <h4><TrendingDown size={20} /> Put Option</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Premium:</span>
                      <span className="value">₹{chainData.chain.find(r => r.strike === selectedStrike).put.premium}</span>
                    </div>
                    <div className="detail-item">
                      <span>Delta:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).put.greeks.delta}</span>
                    </div>
                    <div className="detail-item">
                      <span>Gamma:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).put.greeks.gamma}</span>
                    </div>
                    <div className="detail-item">
                      <span>Theta:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).put.greeks.theta}</span>
                    </div>
                    <div className="detail-item">
                      <span>Vega:</span>
                      <span className="value">{chainData.chain.find(r => r.strike === selectedStrike).put.greeks.vega}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OptionsChain;
