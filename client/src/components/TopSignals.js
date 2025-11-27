import React from 'react';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import './TopSignals.css';

function TopSignals({ signals }) {
  return (
    <div className="top-signals">
      <div className="top-signals-header">
        <Award size={20} />
        <h3>Top Signals</h3>
      </div>

      <div className="signals-summary">
        {signals.length === 0 ? (
          <p className="no-data">No signals yet</p>
        ) : (
          signals.slice(0, 5).map((signal, idx) => (
            <div key={idx} className={`signal-summary ${signal.action.toLowerCase()}`}>
              <div className="signal-icon">
                {signal.action === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="signal-info">
                <div className="signal-name">{signal.name}</div>
                <div className="signal-details">
                  <span className="confidence">{signal.confidence}%</span>
                  <span className="action">{signal.action}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TopSignals;
