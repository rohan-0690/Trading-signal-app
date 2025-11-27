# 🇮🇳 NSE/BSE Nifty 50 Trading Signals App

Real-time trading signal analyzer for Indian stock market with AI-powered Buy/Sell recommendations for Nifty 50 stocks.

## 🎯 Features

- ✅ **Nifty 50 Stock Analysis** - All 50 stocks from NSE
- ✅ **Real-time Data** - Live prices from Yahoo Finance
- ✅ **Buy/Sell Signals** - AI-powered trading recommendations
- ✅ **Entry & Exit Points** - Precise entry prices with targets
- ✅ **Stop Loss Calculation** - Risk management with ATR-based SL
- ✅ **3 Target Levels** - T1, T2, T3 for profit booking
- ✅ **Confidence Scores** - 0-100% confidence for each signal
- ✅ **Pattern Detection** - 9 candlestick + 3 chart patterns
- ✅ **Technical Indicators** - RSI, MACD, EMA, ATR, Volume
- ✅ **Nifty 50 & Sensex Index** - Live index tracking
- ✅ **Sector Analysis** - Sector-wise sentiment
- ✅ **Beautiful UI** - Modern, responsive Indian-themed design

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm run install-all

# 2. Create .env file
cp .env.example .env

# 3. Start MongoDB
mongod

# 4. Run the app
npm run dev

# 5. Open browser
# http://localhost:3000
```

## 📊 Example Signal Output

```
Stock: Reliance Industries (RELIANCE.NS)
Sector: Energy
Action: BUY
Entry: ₹2,450.00
Stop Loss: ₹2,415.00
Target 1: ₹2,485.00
Target 2: ₹2,520.00
Target 3: ₹2,590.00
Confidence: 82% Bullish
Risk:Reward: 1.85:1
Reason: Bullish Engulfing + High Volume + EMA Crossover + RSI Oversold
```

## 🏗️ Tech Stack

- **Backend:** Node.js, Express, WebSocket
- **Frontend:** React 18, Framer Motion
- **Database:** MongoDB
- **Data Source:** Yahoo Finance API
- **Indicators:** technicalindicators library

## 📈 Supported Stocks

All Nifty 50 stocks including:
- Reliance Industries
- TCS
- HDFC Bank
- Infosys
- ICICI Bank
- And 45 more...

## 🎯 How It Works

1. **Data Collection** - Fetches real-time data from Yahoo Finance
2. **Pattern Detection** - Analyzes candlestick and chart patterns
3. **Technical Analysis** - Calculates RSI, MACD, EMA, ATR
4. **Signal Generation** - AI scoring system generates Buy/Sell signals
5. **Risk Management** - Calculates entry, stop loss, and targets
6. **Display** - Shows signals with confidence scores

## 💡 Trading Tips

- Only trade signals above 75% confidence
- Always use stop loss
- Book partial profits at T1, T2, T3
- Never risk more than 2% per trade
- Wait for multiple confirmations

## 📱 Features

### Index Dashboard
- Live Nifty 50 index
- Live Sensex index
- Real-time price updates

### Stock Analysis
- Click any Nifty 50 stock
- Get instant Buy/Sell signal
- Entry, Stop Loss, 3 Targets
- Confidence score
- Pattern analysis

### Top Signals
- Best 5 trading opportunities
- Sorted by confidence
- Real-time updates

## 🔧 Configuration

Edit `.env` file:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/indian-stocks
```

## 📚 API Endpoints

```
GET  /api/nifty50/stocks        - Get all Nifty 50 stocks
GET  /api/stock/price/:symbol   - Get current price
POST /api/stock/signal          - Generate trading signal
GET  /api/nifty50/signals       - Get signals for all stocks
GET  /api/index/nifty50         - Get Nifty 50 index
GET  /api/index/sensex          - Get Sensex index
GET  /api/signals/top           - Get top 5 signals
```

## 🎨 UI Features

- Indian flag colors theme (Saffron, White, Green)
- Glassmorphism design
- Smooth animations
- Responsive layout
- Real-time updates

## ⚠️ Disclaimer

This app is for educational purposes only. Not financial advice. Always do your own research before trading.

## 📝 License

MIT License

---

**Made with ❤️ for Indian traders**
