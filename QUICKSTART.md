# 🚀 Quick Start Guide

Get your Trading Signal App running in 5 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
npm run install-all
```

This installs both backend and frontend dependencies.

## Step 2: Setup Environment (1 minute)

Create `.env` file in root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trading-signals
```

**Note:** API keys are optional for testing. The app will work with Binance public endpoints.

## Step 3: Start MongoDB (30 seconds)

**Windows:**
```bash
mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Don't have MongoDB?** Use MongoDB Atlas (free cloud database):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in .env

## Step 4: Run the App (30 seconds)

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

## Step 5: Open Browser (10 seconds)

Navigate to: **http://localhost:3000**

You should see the Trading Signal App dashboard!

## 🎉 You're Done!

The app will now:
- ✅ Fetch real-time data from Binance
- ✅ Analyze candlestick patterns
- ✅ Generate Buy/Sell signals
- ✅ Display live charts
- ✅ Calculate risk management

## 🔥 First Steps

1. **Select a Symbol:** Click on any crypto in the watchlist (left sidebar)
2. **Change Timeframe:** Click timeframe buttons (1m, 5m, 15m, etc.)
3. **Wait for Signals:** Signals appear automatically when patterns are detected
4. **Adjust Risk:** Use the Risk Manager (right sidebar) to calculate position sizes

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud database

### "Port 3000 already in use"
- Kill the process: `npx kill-port 3000`
- Or change port in client/package.json

### "WebSocket connection failed"
- Make sure backend is running on port 5000
- Check if firewall is blocking connections

### "No signals appearing"
- Wait 5-10 seconds for data to load
- Check browser console for errors
- Verify Binance API is accessible

## 📱 Test the Features

### Generate a Signal Manually
```bash
curl -X POST http://localhost:5000/api/signals/generate \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","timeframe":"5m"}'
```

### Get Current Price
```bash
curl http://localhost:5000/api/market/price/BTCUSDT
```

### View Signal History
```bash
curl http://localhost:5000/api/signals?limit=10
```

## 🎨 Customize

### Add Your Favorite Coins
Edit `client/src/components/Watchlist.js`:
```javascript
const [symbols] = useState([
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 45320, change: 2.5 },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 2850, change: 1.8 },
  // Add more here!
]);
```

### Change Signal Sensitivity
Edit `server/services/signalEngine.js`:
```javascript
if (confidence < 60) {  // Lower = more signals, Higher = fewer but stronger
  return { signal: 'AVOID', confidence: 0 };
}
```

## 🚀 Next Steps

1. Read [FEATURES.md](FEATURES.md) for complete feature list
2. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed configuration
3. Get API keys for more data sources
4. Customize patterns and indicators
5. Deploy to production

## 💡 Pro Tips

- **Best for Day Trading:** Use 5m and 15m timeframes
- **Best for Swing Trading:** Use 1h and 4h timeframes
- **High Confidence:** Only trade signals above 75% confidence
- **Risk Management:** Never risk more than 2% per trade
- **Multiple Confirmations:** Wait for 2-3 indicators to align

## 🆘 Need Help?

- Check the logs in your terminal
- Open browser DevTools (F12) and check Console
- Verify all dependencies are installed
- Make sure MongoDB is running
- Check network connectivity

## 🎯 What's Working

After setup, you should see:
- ✅ Live price updates
- ✅ Candlestick chart
- ✅ Watchlist with multiple symbols
- ✅ Risk calculator
- ✅ Real-time signals (when patterns detected)

Enjoy trading! 📈🚀
