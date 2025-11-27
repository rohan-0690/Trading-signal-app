import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import './CandlestickChart.css';

function CandlestickChart({ symbol, stockName }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('5m');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchChartData();
    }
  }, [symbol, timeframe]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/stock/data/${symbol}`, {
        params: {
          interval: timeframe,
          period: timeframe === '1d' ? '5d' : '1d'
        }
      });

      if (response.data.success) {
        const candles = response.data.data;

        // Format data for candlestick chart
        const formatted = candles.slice(-50).map((candle, idx) => {
          const isGreen = candle.close >= candle.open;
          return {
            time: new Date(candle.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
            isGreen: isGreen,
            // For candlestick body
            body: [Math.min(candle.open, candle.close), Math.max(candle.open, candle.close)],
            // For wicks
            upperWick: candle.high - Math.max(candle.open, candle.close),
            lowerWick: Math.min(candle.open, candle.close) - candle.low
          };
        });

        setChartData(formatted);

        // Calculate stats
        if (candles.length > 0) {
          const firstCandle = candles[0];
          const lastCandle = candles[candles.length - 1];
          const change = lastCandle.close - firstCandle.open;
          const changePercent = (change / firstCandle.open) * 100;
          const high = Math.max(...candles.map(c => c.high));
          const low = Math.min(...candles.map(c => c.low));

          setStats({
            current: lastCandle.close,
            change: change,
            changePercent: changePercent,
            high: high,
            low: low,
            volume: candles.reduce((sum, c) => sum + c.volume, 0)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
