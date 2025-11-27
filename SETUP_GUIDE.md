# Trading Signal App - Complete Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v5 or higher)
3. **npm** or **yarn**

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB from https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update .env file

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trading-signals

# Binance API (for crypto data)
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here

# AlphaVantage API (for stock data)
ALPHA_VANTAGE_KEY=your_alpha_vantage_key_here
```

### 4. Get API Keys

**Binance API:**
1. Go to https://www.binance.com/
2. Create account and verify
3. Go to API Management
4. Create new API key
5. Copy API Key and Secret Key

**AlphaVantage API:**
1. Go to https://www.alphavantage.co/support/#api-key
2. Get free API key
3. Copy the key

### 5. Run the Application

```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features Overview

### 1. Real-time Market Data
- Live candlestick data from Binance
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- WebSocket connections for instant updates

### 2. Pattern Detection
**Candlestick Patterns:**
- Hammer
- Shooting Star
- Doji
- Bullish/Bearish Engulfing
- Morning/Evening Star
- Three White Soldiers
- Pin Bar

**Chart Patterns:**
- Double Top/Bottom
- Head & Shoulders
- Triangles
- Wedges

### 3. Technical Indicators
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- EMA (Exponential Moving Average)
- ATR (Average True Range)
- Bollinger Bands
- Support & Resistance levels

### 4. AI Signal Generation
- Confidence scoring (0-100%)
- Entry price calculation
- Stop loss based on ATR
- Multiple target levels (T1, T2, T3)
- Risk-reward ratio calculation

### 5. Risk Management
- Position size calculator
- Capital management
- Leverage calculator
- Max loss calculation

## API Endpoints

### Market Data
```
GET /api/market/candles/:symbol?interval=5m&limit=100
GET /api/market/price/:symbol
```

### Signals
```
GET /api/signals?symbol=BTCUSDT&status=active&limit=50
POST /api/signals/generate
GET /api/signals/accuracy
```

### Alerts
```
GET /api/alerts?userId=user123
POST /api/alerts
DELETE /api/alerts/:id
```

## Customization

### Add New Symbols
Edit `client/src/components/Watchlist.js`:
```javascript
const [symbols] = useState([
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 45320, change: 2.5 },
  // Add more symbols here
]);
```

### Adjust Signal Sensitivity
Edit `server/services/signalEngine.js`:
```javascript
if (confidence < 60) {  // Change threshold
  return { signal: 'AVOID', confidence: 0 };
}
```

### Modify Risk Parameters
Edit `client/src/components/RiskManager.js` to change default values.

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### WebSocket Connection Failed
- Check if backend is running on port 5000
- Verify firewall settings
- Check browser console for errors

### API Rate Limits
- Binance: 1200 requests per minute
- AlphaVantage: 5 requests per minute (free tier)

## Production Deployment

### Backend (Node.js)
```bash
# Build and start
npm run build
NODE_ENV=production node server/index.js
```

### Frontend (React)
```bash
cd client
npm run build
# Serve the build folder with nginx or similar
```

### Environment Variables for Production
- Use MongoDB Atlas for database
- Set secure API keys
- Enable HTTPS
- Configure CORS properly

## Mobile App (Future Enhancement)

To convert to mobile app:
1. Use React Native
2. Keep the same backend
3. Implement push notifications with Firebase
4. Add biometric authentication

## Support

For issues or questions:
- Check the logs in terminal
- Review MongoDB connection
- Verify API keys are correct
- Check network connectivity

## License

MIT License - Feel free to modify and use for your projects.
