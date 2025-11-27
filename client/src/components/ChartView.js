import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ChartView.css';

function ChartView({ symbol }) {
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('5m');

  const fetchChartData = async () => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
      const response = await axios.get(`${API_BASE_URL}/api/market/candles/${symbol}`, {
        params: { interval: timeframe, limit: 50 }
      });
      
      const formatted = response.data.data.map(candle => ({
        time: new Date(candle.timestamp).toLocaleTimeString(),
        price: candle.close,
        high: candle.high,
        low: candle.low,
        open: candle.open,
        close: candle.close,
        candleColor: candle.close >= candle.open ? '#38ef7d' : '#eb3349',
        wickHigh: candle.high - Math.max(candle.open, candle.close),
        wickLow: Math.min(candle.open, candle.close) - candle.low,
        body: Math.abs(candle.close - candle.open)
      }));
      
      setChartData(formatted);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe]);

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
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '10px'
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{ background: 'rgba(0,0,0,0.9)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <p style={{ color: '#fff', margin: '5px 0' }}><strong>{data.time}</strong></p>
                    <p style={{ color: '#38ef7d', margin: '5px 0' }}>Open: ${data.open?.toFixed(2)}</p>
                    <p style={{ color: '#667eea', margin: '5px 0' }}>High: ${data.high?.toFixed(2)}</p>
                    <p style={{ color: '#f2994a', margin: '5px 0' }}>Low: ${data.low?.toFixed(2)}</p>
                    <p style={{ color: data.close >= data.open ? '#38ef7d' : '#eb3349', margin: '5px 0' }}>
                      Close: ${data.close?.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="body" fill="#667eea">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.candleColor} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="high" stroke="rgba(102, 126, 234, 0.3)" strokeWidth={1} dot={false} />
          <Line type="monotone" dataKey="low" stroke="rgba(102, 126, 234, 0.3)" strokeWidth={1} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartView;
