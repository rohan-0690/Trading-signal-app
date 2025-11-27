import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Shield, Activity } from 'lucide-react';
import './StockSignalCard.css';

function StockSignalCard({ signal, detailed = false }) {
  const isBuy = signal.action === 'BUY';
  
  return (
    <motion.div
      className={`stock-signal-card ${isBuy ? 'buy' : 'sell'} ${detailed ? 'detailed' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <div className="stock-info">
          <h3>{signal.name}</h3>
          <span className="stock-symbol">{signal.symbol}</span>
          <span className="sector-badge">{signal.sector}</span>
        </div>
        <div className="signal-badge">
          {isBuy ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          <span>{signal.action}</span>
        </div>
      </div>

      <div className="confidence-bar">
        <div className="confidence-label">
          <Activity size={16} />
          <span>Confidence: {signal.confidence}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${signal.confidence}%` }}
          />
        </div>
      </div>

      <div className="price-levels">
        <div className="level-item entry">
          <span className="label">Entry Price</span>
          <span className="value">₹{signal.entry.toFixed(2)}</span>
        </div>
        
        <div className="level-item stop-loss">
          <Shield size={16} />
          <span className="label">Stop Loss</span>
          <span className="value">₹{signal.stopLoss.toFixed(2)}</span>
        </div>
      </div>

      <div className="targets">
        <div className="targets-header">
          <Target size={16} />
          <span>Targets</span>
        </div>
        <div className="targets-grid">
          <div className="target-item">
            <span className="target-label">T1</span>
            <span className="target-value">₹{signal.targets.t1.toFixed(2)}</span>
          </div>
          <div className="target-item">
            <span className="target-label">T2</span>
            <span className="target-value">₹{signal.targets.t2.toFixed(2)}</span>
          </div>
          <div className="target-item">
            <span className="target-label">T3</span>
            <span className="target-value">₹{signal.targets.t3.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="signal-reason">
        <strong>Analysis:</strong> {signal.reason}
      </div>

      {signal.duration && (
        <div className="duration-info">
          <div className="duration-header">
            <strong>⏱️ Expected Duration:</strong>
          </div>
          <div className="duration-details">
            <div className="duration-item">
              <span className="duration-label">Trading Style:</span>
              <span className="duration-value">{signal.duration.tradingStyle}</span>
            </div>
            <div className="duration-item">
              <span className="duration-label">Holding Period:</span>
              <span className="duration-value highlight">{signal.duration.holdingPeriod}</span>
            </div>
            <div className="duration-item">
              <span className="duration-label">Target Move:</span>
              <span className="duration-value">{signal.duration.percentMove}%</span>
            </div>
          </div>
        </div>
      )}

      {detailed && signal.patterns && (
        <div className="patterns-detected">
          <strong>Patterns:</strong>
          <div className="pattern-tags">
            {signal.patterns.map((pattern, idx) => (
              <span key={idx} className="pattern-tag">{pattern}</span>
            ))}
          </div>
        </div>
      )}

      <div className="card-footer">
        <span className="risk-reward">R:R {signal.riskReward}:1</span>
        <span className="timestamp">
          {new Date(signal.timestamp).toLocaleTimeString('en-IN')}
        </span>
      </div>
    </motion.div>
  );
}

export default StockSignalCard;
