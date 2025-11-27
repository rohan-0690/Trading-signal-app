import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Shield } from 'lucide-react';
import './SignalCard.css';

function SignalCard({ signal }) {
  const isBuy = signal.signal === 'BUY';
  
  return (
    <motion.div
      className={`signal-card ${isBuy ? 'buy' : 'sell'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="signal-header">
        <div className="signal-type">
          {isBuy ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          <span className="signal-text">{signal.signal}</span>
        </div>
        <div className="confidence">
          <span className="confidence-value">{signal.confidence}%</span>
          <span className="confidence-label">Confidence</span>
        </div>
      </div>

      <div className="signal-symbol">
        <h2>{signal.symbol}</h2>
        <span className="timeframe">{signal.timeframe}</span>
      </div>

      <div className="signal-details">
        <div className="detail-row">
          <span className="label">Entry:</span>
          <span className="value">${signal.entry}</span>
        </div>
        <div className="detail-row stop-loss">
          <Shield size={16} />
          <span className="label">Stop Loss:</span>
          <span className="value">${signal.stopLoss}</span>
        </div>
        <div className="targets">
          <Target size={16} />
          <div className="target-list">
            <div className="target-item">
              <span>T1:</span>
              <span>${signal.targets.t1}</span>
            </div>
            <div className="target-item">
              <span>T2:</span>
              <span>${signal.targets.t2}</span>
            </div>
            <div className="target-item">
              <span>T3:</span>
              <span>${signal.targets.t3}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="signal-reason">
        <strong>Reason:</strong> {signal.reason}
      </div>

      <div className="signal-footer">
        <span className="risk-reward">R:R {signal.riskReward}:1</span>
        <span className="timestamp">
          {new Date(signal.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}

export default SignalCard;
