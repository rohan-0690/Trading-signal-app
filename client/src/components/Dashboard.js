import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, TrendingUp, Target, Award } from 'lucide-react';
import './Dashboard.css';

function Dashboard({ symbol }) {
  const [stats, setStats] = useState({
    price: 0,
    change24h: 0,
    volume: 0,
    accuracy: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  const fetchStats = async () => {
    try {
      const [priceRes, accuracyRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/market/price/${symbol}`),
        axios.get('http://localhost:5000/api/signals/accuracy')
      ]);

      setStats(prev => ({
        ...prev,
        price: priceRes.data.data.price,
        accuracy: accuracyRes.data.data.accuracy
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="stat-card">
        <Activity className="stat-icon" />
        <div className="stat-content">
          <span className="stat-label">Current Price</span>
          <span className="stat-value">${stats.price.toFixed(2)}</span>
        </div>
      </div>

      <div className="stat-card">
        <TrendingUp className="stat-icon" />
        <div className="stat-content">
          <span className="stat-label">24h Change</span>
          <span className="stat-value positive">+{stats.change24h}%</span>
        </div>
      </div>

      <div className="stat-card">
        <Target className="stat-icon" />
        <div className="stat-content">
          <span className="stat-label">Active Signals</span>
          <span className="stat-value">12</span>
        </div>
      </div>

      <div className="stat-card">
        <Award className="stat-icon" />
        <div className="stat-content">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{stats.accuracy}%</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
