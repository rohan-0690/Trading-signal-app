import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './IndexDashboard.css';

function IndexDashboard() {
  const [nifty, setNifty] = useState(null);
  const [sensex, setSensex] = useState(null);

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchIndices = async () => {
    try {
      const [niftyRes, sensexRes] = await Promise.all([
        axios.get('/api/index/nifty50'),
        axios.get('/api/index/sensex')
      ]);
      
      if (niftyRes.data.success) setNifty(niftyRes.data.data);
      if (sensexRes.data.success) setSensex(sensexRes.data.data);
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  };

  const IndexCard = ({ data }) => {
    if (!data) return null;
    const isPositive = data.change >= 0;
    
    return (
      <div className={`index-card ${isPositive ? 'positive' : 'negative'}`}>
        <div className="index-name">{data.symbol}</div>
        <div className="index-price">₹{data.price.toFixed(2)}</div>
        <div className="index-change">
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{isPositive ? '+' : ''}{data.change.toFixed(2)}</span>
          <span>({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="index-dashboard">
      <IndexCard data={nifty} />
      <IndexCard data={sensex} />
    </div>
  );
}

export default IndexDashboard;
