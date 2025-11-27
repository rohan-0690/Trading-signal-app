import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bitcoin, TrendingUp, TrendingDown, Search, Loader, Target, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import './CryptoAnalyzer.css';

function CryptoAnalyzer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [cryptoData, setCryptoData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [cryptoList, setCryptoList] = useState([]);

  const popularCryptos = [
    { symbol: 'BTC-USD', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETH-USD', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'BNB-USD', name: 'Binance Coin', icon: 'BNB' },
    { symbol: 'SOL-USD', name: 'Solana', icon: 'SOL' },
    { symbol: 'XRP-USD', name: 'Ripple', icon: 'XRP' },
    { symbol: 'ADA-USD', name: 'Cardano', icon: 'ADA' },
    { symbol: 'DOGE-USD', name: 'Dogecoin', icon: 'DOGE' },
    { symbol: 'MATIC-USD', name: 'Polygon', icon: 'MATIC' },
    { symbol: 'DOT-USD', name: 'Polkadot', icon: 'DOT' },
    { symbol: 'AVAX-USD', name: 'Avalanche', icon: 'AVAX' },
    { symbol: 'LINK-USD', name: 'Chainlink', icon: 'LINK' },
    { symbol: 'UNI-USD', name: 'Uniswap', icon: 'UNI' },
    { symbol: 'LTC-USD', name: 'Litecoin', icon: 'LTC' },
    { symbol: 'ATOM-USD', name: 'Cosmos', icon: 'ATOM' },
    { symbol: 'TRX-USD', name: 'Tron', icon: 'TRX' },
    { symbol: 'SHIB-USD', name: 'Shiba Inu', icon: 'SHIB' },
    { symbol: 'APT-USD', name: 'Aptos', icon: 'APT' },
    { symbol: 'ARB-USD', name: 'Arbitrum', icon: 'ARB' },
    { symbol: 'OP-USD', name: 'Optimism', icon: 'OP' },
    { symbol: 'INJ-USD', name: 'Injective', icon: 'INJ' },
    { symbol: 'SUI-USD', name: 'Sui', icon: 'SUI' },
    { symbol: 'PEPE-USD', name: 'Pepe', icon: 'PEPE' },
    { symbol: 'FET-USD', name: 'Fetch.ai', icon: 'FET' },
    { symbol: 'NEAR-USD', name: 'Near Protocol', icon: 'NEAR' }
  ];

  // Auto-fetch popular cryptos on mount
  useEffect(() => {
    fetchPopularCryptos();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchPopularCryptos, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPopularCryptos = async () => {
    try {
      // Fetch top 8 cryptos for live display
      const cryptoPromises = popularCryptos.slice(0, 8).map(async (crypto) => {
        try {
          const response = await axios.get(`/api/stock/price/${crypto.symbol}`);
          if (response.data.success) {
            return {
              ...crypto,
              price: response.data.data.price,
              change: response.data.data.change,
              changePercent: response.data.data.changePercent
            };
          }
        } catch (error) {
          console.error(`Error fetching ${crypto.symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(cryptoPromises);
      const validResults = results.filter(r => r !== null);
      if (validResults.length > 0) {
        setCryptoList(validResults);
      }
    } catch (error) {
      console.error('Error fetching crypto list:', error);
    }
  };

  const analyzeCrypto = async (symbol) => {
    setLoading(true);
    setSearchQuery(symbol);
    
    try {
      const response = await axios.get(`/api/stock/price/${symbol}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setCryptoData(data);
        
        // Calculate targets based on current price
        const price = data.price;
        const entry = price;
        const sl = price * 0.95; // 5% stop loss
        const target1 = price * 1.05; // 5% profit
        const target2 = price * 1.10; // 10% profit
        const target3 = price * 1.15; // 15% profit
        
        // Determine signal based on change
        const changePercent = data.changePercent || 0;
        let signal = 'HOLD';
        let confidence = 50;
        
        if (changePercent > 2) {
          signal = 'BUY';
          confidence = Math.min(60 + changePercent * 2, 85);
        } else if (changePercent < -2) {
          signal = 'SELL';
          confidence = Math.min(60 + Math.abs(changePercent) * 2, 85);
        }
        
        // Calculate holding period
        let holdingPeriod = '1-4 hours';
        let tradingStyle = 'Intraday';
        
        if (Math.abs(changePercent) > 5) {
          holdingPeriod = '30 minutes - 2 hours';
          tradingStyle = 'Scalping';
        } else if (Math.abs(changePercent) < 1) {
          holdingPeriod = '4-24 hours';
          tradingStyle = 'Swing';
        }
        
        setAnalysis({
          signal,
          confidence,
          entry: entry.toFixed(2),
          sl: sl.toFixed(2),
          target1: target1.toFixed(2),
          target2: target2.toFixed(2),
          target3: target3.toFixed(2),
          rr: ((target1 - entry) / (entry - sl)).toFixed(2),
          holdingPeriod,
          tradingStyle
        });
        
        toast.success(`Analysis complete for ${symbol}`);
      }
    } catch (error) {
      toast.error(`Could not fetch data for ${symbol}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning('Please enter a crypto symbol');
      return;
    }
    
    const symbol = searchQuery.toUpperCase().includes('-USD') 
      ? searchQuery.toUpperCase() 
      : `${searchQuery.toUpperCase()}-USD`;
    
    analyzeCrypto(symbol);
  };

  return (
    <div className="crypto-analyzer">
      <div className="crypto-header">
        <Bitcoin size={40} />
        <div>
          <h2>Cryptocurrency Analysis</h2>
          <p>Real-time crypto price analysis with trading signals</p>
        </div>
      </div>

      <div className="crypto-search">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Enter crypto symbol (e.g., BTC, ETH, SOL)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? <Loader size={20} className="spinner" /> : 'Analyze'}
            </button>
          </div>
        </form>
      </div>

      <div className="popular-cryptos">
        <h3>⚡ Top Cryptocurrencies - Live Prices</h3>
        <div className="crypto-grid">
          {cryptoList.length > 0 ? (
            cryptoList.map((crypto, idx) => (
              <button
                key={idx}
                className="crypto-btn with-price"
                onClick={() => analyzeCrypto(crypto.symbol)}
                disabled={loading}
              >
                <span className="crypto-icon">{crypto.icon}</span>
                <span className="crypto-name">{crypto.name}</span>
                <span className="crypto-price">${crypto.price.toFixed(2)}</span>
                <span className={`crypto-change ${crypto.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.changePercent >= 0 ? '▲' : '▼'} {Math.abs(crypto.changePercent).toFixed(2)}%
                </span>
              </button>
            ))
          ) : (
            popularCryptos.slice(0, 8).map((crypto, idx) => (
              <button
                key={idx}
                className="crypto-btn"
                onClick={() => analyzeCrypto(crypto.symbol)}
                disabled={loading}
              >
                <span className="crypto-icon">{crypto.icon}</span>
                <span className="crypto-name">{crypto.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="all-cryptos-section">
        <h3>📋 All Available Cryptocurrencies</h3>
        <div className="all-crypto-grid">
          {popularCryptos.map((crypto, idx) => (
            <button
              key={idx}
              className="crypto-list-btn"
              onClick={() => analyzeCrypto(crypto.symbol)}
              disabled={loading}
            >
              <span className="crypto-icon-small">{crypto.icon}</span>
              <span className="crypto-name-small">{crypto.name}</span>
            </button>
          ))}
        </div>
      </div>

      {cryptoData && (
        <div className="crypto-results">
          <div className="crypto-price-card">
            <div className="price-header">
              <h3>{searchQuery.replace('-USD', '')}</h3>
              <span className={`price-change ${cryptoData.change >= 0 ? 'positive' : 'negative'}`}>
                {cryptoData.change >= 0 ? '▲' : '▼'} {Math.abs(cryptoData.changePercent).toFixed(2)}%
              </span>
            </div>
            
            <div className="current-price">
              <span className="price-label">Current Price</span>
              <span className="price-value">${cryptoData.price.toFixed(2)}</span>
            </div>

            <div className="price-stats">
              <div className="stat-item">
                <span className="stat-label">24h High</span>
                <span className="stat-value">${cryptoData.dayHigh?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">24h Low</span>
                <span className="stat-value">${cryptoData.dayLow?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Volume</span>
                <span className="stat-value">{cryptoData.volume ? (cryptoData.volume / 1e9).toFixed(2) + 'B' : 'N/A'}</span>
              </div>
            </div>
          </div>

          {analysis && (
            <div className="crypto-analysis-card">
              <div className="analysis-header">
                <h3>Trading Signal</h3>
                <div className="signal-badges">
                  <span className={`signal-badge ${analysis.signal.toLowerCase()}`}>
                    {analysis.signal === 'BUY' && <TrendingUp size={16} />}
                    {analysis.signal === 'SELL' && <TrendingDown size={16} />}
                    {analysis.signal}
                  </span>
                  <span className="confidence-badge">
                    {analysis.confidence}% Confidence
                  </span>
                </div>
              </div>

              <div className="holding-period">
                <h4>⏱️ Recommended Holding Period</h4>
                <div className="holding-info">
                  <div className="holding-detail">
                    <span className="label">Trading Style:</span>
                    <span className="value">{analysis.tradingStyle}</span>
                  </div>
                  <div className="holding-detail">
                    <span className="label">Hold Duration:</span>
                    <span className="value highlight">{analysis.holdingPeriod}</span>
                  </div>
                </div>
              </div>

              <div className="targets-section">
                <div className="target-item entry">
                  <Shield size={18} />
                  <div>
                    <span className="label">Entry</span>
                    <span className="value">${analysis.entry}</span>
                  </div>
                </div>

                <div className="target-item sl">
                  <span className="label">Stop Loss</span>
                  <span className="value">${analysis.sl}</span>
                  <span className="percent">-5%</span>
                </div>

                <div className="target-item t1">
                  <Target size={18} />
                  <div>
                    <span className="label">Target 1</span>
                    <span className="value">${analysis.target1}</span>
                    <span className="percent">+5%</span>
                  </div>
                </div>

                <div className="target-item t2">
                  <Target size={18} />
                  <div>
                    <span className="label">Target 2</span>
                    <span className="value">${analysis.target2}</span>
                    <span className="percent">+10%</span>
                  </div>
                </div>

                <div className="target-item t3">
                  <Target size={18} />
                  <div>
                    <span className="label">Target 3</span>
                    <span className="value">${analysis.target3}</span>
                    <span className="percent">+15%</span>
                  </div>
                </div>

                <div className="target-item rr">
                  <span className="label">Risk:Reward</span>
                  <span className="value">1:{analysis.rr}</span>
                </div>
              </div>

              <div className="crypto-tips">
                <h4>💡 Crypto Trading Tips:</h4>
                <ul>
                  <li>Crypto markets are 24/7 - high volatility expected</li>
                  <li>Use strict stop losses - crypto can move fast</li>
                  <li>Book profits at each target level</li>
                  <li>Monitor Bitcoin dominance for altcoin trades</li>
                  <li>Be aware of major news and regulatory updates</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CryptoAnalyzer;
