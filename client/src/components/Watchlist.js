import React, { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import './Watchlist.css';

function Watchlist({ onSymbolSelect, activeSymbol }) {
  const [symbols] = useState([
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: 45320, change: 2.5 },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: 2850, change: 1.8 },
    { symbol: 'BNBUSDT', name: 'BNB', price: 320, change: -0.5 },
    { symbol: 'ADAUSDT', name: 'Cardano', price: 0.58, change: 3.2 },
    { symbol: 'SOLUSDT', name: 'Solana', price: 98, change: 5.1 }
  ]);

  return (
    <div className="watchlist">
      <div className="watchlist-header">
        <h3>Watchlist</h3>
        <button className="add-btn">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="watchlist-items">
        {symbols.map(item => (
          <div
            key={item.symbol}
            className={`watchlist-item ${activeSymbol === item.symbol ? 'active' : ''}`}
            onClick={() => onSymbolSelect(item.symbol)}
          >
            <div className="item-left">
              <Star size={16} className="star-icon" />
              <div className="item-info">
                <span className="item-symbol">{item.symbol}</span>
                <span className="item-name">{item.name}</span>
              </div>
            </div>
            <div className="item-right">
              <span className="item-price">${item.price}</span>
              <span className={`item-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;
