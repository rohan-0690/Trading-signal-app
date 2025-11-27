require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const path = require('path');
const marketDataRouter = require('./routes/marketData');
const signalsRouter = require('./routes/signals');
const alertsRouter = require('./routes/alerts');
const MarketDataService = require('./services/marketDataService');
const SignalEngine = require('./services/signalEngine');

// Indian Stock Market Services
const NSEDataService = require('./services/nseDataService');
const IndianStockSignalEngine = require('./services/indianStockSignalEngine');
const OptionsCalculator = require('./services/optionsCalculator');
const { NIFTY_50_STOCKS } = require('./config/nifty50');

const nseDataService = new NSEDataService();
const indianSignalEngine = new IndianStockSignalEngine();
const optionsCalculator = new OptionsCalculator();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/market', marketDataRouter);
app.use('/api/signals', signalsRouter);
app.use('/api/alerts', alertsRouter);

// Indian Stock Market Routes
app.get('/api/nifty50/stocks', (req, res) => {
  res.json({ success: true, data: NIFTY_50_STOCKS });
});

app.get('/api/stock/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await nseDataService.getCurrentPrice(symbol);
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stock/signal', async (req, res) => {
  try {
    const { symbol, name, sector } = req.body;
    const candles = await nseDataService.getStockData(symbol, '1d', '5m');
    const signal = indianSignalEngine.analyzeStock(candles, { symbol, name, sector });
    
    if (!signal) {
      return res.json({ 
        success: false, 
        message: 'No strong signal detected. HOLD recommended.' 
      });
    }
    
    res.json({ success: true, data: signal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/index/nifty50', async (req, res) => {
  try {
    const nifty = await nseDataService.getNifty50Index();
    res.json({ success: true, data: nifty });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/index/sensex', async (req, res) => {
  try {
    const sensex = await nseDataService.getSensexIndex();
    res.json({ success: true, data: sensex });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/options/premium/:strike/:type', async (req, res) => {
  try {
    const { strike, type } = req.params;
    const nifty = await nseDataService.getNifty50Index();
    const spotPrice = nifty.price;
    
    const premium = optionsCalculator.calculatePremium(
      spotPrice, 
      parseFloat(strike), 
      type.toUpperCase()
    );
    
    const greeks = optionsCalculator.calculateGreeks(
      spotPrice,
      parseFloat(strike),
      type.toUpperCase()
    );
    
    res.json({ 
      success: true, 
      data: {
        strike: parseFloat(strike),
        type: type.toUpperCase(),
        spotPrice,
        premium: parseFloat(premium.toFixed(2)),
        greeks,
        daysToExpiry: optionsCalculator.getDaysToExpiry(),
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-signals')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function handleClientMessage(ws, data) {
  if (data.type === 'subscribe') {
    ws.symbol = data.symbol;
    ws.timeframe = data.timeframe;
  }
}

// Broadcast market updates
function broadcastUpdate(symbol, data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.symbol === symbol) {
      client.send(JSON.stringify(data));
    }
  });
}

// Initialize services
const marketDataService = new MarketDataService();
const signalEngine = new SignalEngine();

// Start real-time monitoring
setInterval(async () => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  
  for (const symbol of symbols) {
    try {
      const candles = await marketDataService.getCandles(symbol, '5m', 100);
      const signal = signalEngine.analyzeAndGenerateSignal(candles, symbol);
      
      if (signal) {
        broadcastUpdate(symbol, {
          type: 'signal',
          data: signal
        });
      }
    } catch (error) {
      console.error(`Error processing ${symbol}:`, error);
    }
  }
}, 5000);

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
