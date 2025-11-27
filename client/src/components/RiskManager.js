import React, { useState } from 'react';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';
import './RiskManager.css';

function RiskManager() {
  const [capital, setCapital] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [leverage, setLeverage] = useState(1);

  const calculatePosition = () => {
    const riskAmount = (capital * riskPercent) / 100;
    const positionSize = riskAmount * leverage;
    return {
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(2),
      maxLoss: riskAmount.toFixed(2)
    };
  };

  const position = calculatePosition();

  return (
    <div className="risk-manager">
      <h3>Risk Management</h3>
      
      <div className="risk-input-group">
        <label>
          <DollarSign size={16} />
          Capital
        </label>
        <input
          type="number"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
          className="risk-input"
        />
      </div>

      <div className="risk-input-group">
        <label>
          <Percent size={16} />
          Risk per Trade
        </label>
        <input
          type="number"
          value={riskPercent}
          onChange={(e) => setRiskPercent(Number(e.target.value))}
          className="risk-input"
          min="0.5"
          max="5"
          step="0.5"
        />
      </div>

      <div className="risk-input-group">
        <label>
          <TrendingUp size={16} />
          Leverage
        </label>
        <input
          type="number"
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="risk-input"
          min="1"
          max="10"
        />
      </div>

      <div className="risk-results">
        <div className="risk-result-item">
          <span className="result-label">Position Size:</span>
          <span className="result-value">${position.positionSize}</span>
        </div>
        <div className="risk-result-item">
          <span className="result-label">Max Loss:</span>
          <span className="result-value negative">${position.maxLoss}</span>
        </div>
        <div className="risk-result-item">
          <span className="result-label">Risk Amount:</span>
          <span className="result-value">${position.riskAmount}</span>
        </div>
      </div>
    </div>
  );
}

export default RiskManager;
