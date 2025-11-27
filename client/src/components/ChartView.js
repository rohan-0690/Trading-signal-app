import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ChartView.css';

function ChartView({ symbol }) {
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('5m');

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeframe]);

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/market/candles/${symbol}`, {
        params: { interval: timeframe, limit: 50 }
      });
      
      const formatted = response.data.data.map(candle => ({
        time: new Date(candle.timestamp).toLocaleTimeString(),
        price: candle.close,
        high: candle.high,
        low: candle.low
      }));
      
      setChartData(formatted);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  return (
    <div className="chart-view">
      <div className="chart-header">
        <h3>Live Chart - {symbol}</h3>
        <div className="timeframe-selector">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
            <button
              key={tf}
              className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              background: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px'
            }}
          />
          <Line type="monotone" dataKey="price" stroke="#667eea" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartView;
