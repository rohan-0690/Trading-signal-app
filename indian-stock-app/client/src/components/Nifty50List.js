import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import './Nifty50List.css';

function Nifty50List({ onStockSelect, loading }) {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('/api/nifty50/stocks');
      if (response.data.success) {
        setStocks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(search.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
    stock.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nifty50-list">
      <div className="list-header">
        <h3>📊 Nifty 50 Stocks</h3>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="stocks-list">
        {filteredStocks.map((stock, idx) => (
          <div
            key={idx}
            className={`stock-item ${loading ? 'disabled' : ''}`}
            onClick={() => !loading && onStockSelect(stock)}
          >
            <div className="stock-name">{stock.name}</div>
            <div className="stock-sector">{stock.sector}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Nifty50List;
