import React, { useState } from 'react';
import { TrendingUp, Bitcoin, BarChart3, Menu, X } from 'lucide-react';
import './Navigation.css';

function Navigation({ activeTab, onTabChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'stocks', label: 'Indian Stocks', icon: <TrendingUp size={20} /> },
    { id: 'crypto', label: 'Crypto', icon: <Bitcoin size={20} /> },
    { id: 'nifty', label: 'NIFTY Options', icon: <BarChart3 size={20} /> }
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <TrendingUp size={28} />
          <span className="brand-name">Trading Signals</span>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-status">
          <span className="live-indicator">🟢 Live</span>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
