# API Testing Guide

Test all endpoints to verify the app is working correctly.

## Prerequisites

Make sure the server is running:
```bash
npm run server
```

## Test Endpoints

### 1. Health Check

```bash
curl http://localhost:5000/api/market/price/BTCUSDT
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "price": 45320.50
  }
}
```

### 2. Get Candlestick Data

```bash
curl "http://localhost:5000/api/market/candles/BTCUSDT?interval=5m&limit=50"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": 1234567890000,
      "open": 45300,
      "high": 45400,
      "low": 45250,
      "close": 45350,
      "volume": 123.45
    }
  ]
}
```

### 3. Generate Trading Signal

```bash
curl -X POST http://localhost:5000/api/signals/generate \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "timeframe": "5m"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "timeframe": "5m",
    "signal": "BUY",
    "entry": 45320,
    "stopLoss": 45110,
    "targets": {
      "t1": 45500,
      "t2": 45800,
      "t3": 46200
    },
    "confidence": 82,
    "reason": "Bullish Engulfing + High Volume + EMA Crossover",
    "patterns": ["Bullish Engulfing"],
    "riskReward": 1.85
  }
}
```

### 4. Get Signal History

```bash
curl "http://localhost:5000/api/signals?limit=10"
```

### 5. Get Signal Accuracy

```bash
curl http://localhost:5000/api/signals/accuracy
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "successful": 75,
    "failed": 25,
    "accuracy": "75.00"
  }
}
```

### 6. Create Alert

```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "symbol": "BTCUSDT",
    "condition": "price_above",
    "value": 50000
  }'
```

### 7. Get User Alerts

```bash
curl "http://localhost:5000/api/alerts?userId=user123"
```

## WebSocket Testing

### Using JavaScript in Browser Console

```javascript
const ws = new WebSocket('ws://localhost:5000');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'subscribe',
    symbol: 'BTCUSDT',
    timeframe: '5m'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Using wscat (CLI tool)

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c ws://localhost:5000

# Send subscription
{"type":"subscribe","symbol":"BTCUSDT","timeframe":"5m"}
```

## Testing Different Symbols

### Crypto (Binance)
- BTCUSDT (Bitcoin)
- ETHUSDT (Ethereum)
- BNBUSDT (Binance Coin)
- ADAUSDT (Cardano)
- SOLUSDT (Solana)
- DOGEUSDT (Dogecoin)
- XRPUSDT (Ripple)

### Test Each Symbol

```bash
for symbol in BTCUSDT ETHUSDT BNBUSDT; do
  echo "Testing $symbol..."
  curl -X POST http://localhost:5000/api/signals/generate \
    -H "Content-Type: application/json" \
    -d "{\"symbol\":\"$symbol\",\"timeframe\":\"5m\"}"
  echo ""
done
```

## Testing Different Timeframes

```bash
for tf in 1m 5m 15m 1h 4h 1d; do
  echo "Testing $tf timeframe..."
  curl "http://localhost:5000/api/market/candles/BTCUSDT?interval=$tf&limit=100"
  echo ""
done
```

## Load Testing

### Simple Load Test

```bash
# Send 100 requests
for i in {1..100}; do
  curl http://localhost:5000/api/market/price/BTCUSDT &
done
wait
```

### Using Apache Bench

```bash
# Install Apache Bench
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install httpd

# Run test
ab -n 1000 -c 10 http://localhost:5000/api/market/price/BTCUSDT
```

## Error Testing

### Invalid Symbol

```bash
curl http://localhost:5000/api/market/price/INVALID
```

**Expected:** Error response

### Invalid Timeframe

```bash
curl "http://localhost:5000/api/market/candles/BTCUSDT?interval=invalid"
```

**Expected:** Error response

### Missing Parameters

```bash
curl -X POST http://localhost:5000/api/signals/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** Error response

## Performance Benchmarks

### Expected Response Times
- Price endpoint: < 100ms
- Candles endpoint: < 500ms
- Signal generation: < 2000ms
- WebSocket latency: < 50ms

### Monitor Performance

```bash
# Using curl with timing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/market/price/BTCUSDT
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

## Database Testing

### Check MongoDB Connection

```bash
# Connect to MongoDB
mongo

# Use database
use trading-signals

# Check collections
show collections

# Count signals
db.signals.count()

# View recent signals
db.signals.find().sort({createdAt: -1}).limit(5).pretty()

# Check accuracy
db.signals.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
])
```

## Frontend Testing

### Open Browser DevTools

1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Go to Console tab
4. Check for errors
5. Go to Network tab
6. Monitor API calls
7. Go to WebSocket tab
8. Verify WebSocket connection

### Test User Interactions

1. **Change Symbol:** Click different symbols in watchlist
2. **Change Timeframe:** Click timeframe buttons
3. **Adjust Risk:** Change values in Risk Manager
4. **Wait for Signals:** Should appear within 5-10 seconds

## Automated Testing Script

Create `test.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  // Test 1: Get Price
  try {
    const res = await axios.get(`${BASE_URL}/market/price/BTCUSDT`);
    console.log('✅ Price API:', res.data.data.price);
  } catch (error) {
    console.log('❌ Price API failed');
  }

  // Test 2: Get Candles
  try {
    const res = await axios.get(`${BASE_URL}/market/candles/BTCUSDT?interval=5m&limit=10`);
    console.log('✅ Candles API:', res.data.data.length, 'candles');
  } catch (error) {
    console.log('❌ Candles API failed');
  }

  // Test 3: Generate Signal
  try {
    const res = await axios.post(`${BASE_URL}/signals/generate`, {
      symbol: 'BTCUSDT',
      timeframe: '5m'
    });
    console.log('✅ Signal API:', res.data.data?.signal || 'No signal');
  } catch (error) {
    console.log('❌ Signal API failed');
  }

  // Test 4: Get Accuracy
  try {
    const res = await axios.get(`${BASE_URL}/signals/accuracy`);
    console.log('✅ Accuracy API:', res.data.data.accuracy + '%');
  } catch (error) {
    console.log('❌ Accuracy API failed');
  }

  console.log('\n✨ Tests completed!');
}

runTests();
```

Run it:
```bash
node test.js
```

## Success Criteria

Your app is working correctly if:
- ✅ All API endpoints return 200 status
- ✅ WebSocket connects successfully
- ✅ Signals are generated with confidence scores
- ✅ Charts display real-time data
- ✅ No console errors in browser
- ✅ MongoDB stores signals correctly
- ✅ Risk calculator updates dynamically

## Common Issues

### "ECONNREFUSED"
- Backend not running
- Wrong port number
- Firewall blocking

### "Cannot GET /api/..."
- Wrong endpoint URL
- Route not registered
- Server crashed

### "WebSocket connection failed"
- Backend not running
- Port 5000 blocked
- CORS issue

### "No signals generated"
- Not enough data
- Confidence threshold too high
- Pattern not detected

## Next Steps

After successful testing:
1. ✅ Deploy to production
2. ✅ Add more symbols
3. ✅ Customize patterns
4. ✅ Integrate more exchanges
5. ✅ Add push notifications
