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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!', timestamp: Date.now() });
});

// Indian Stock Market Routes
app.get('/api/nifty50/stocks', (req, res) => {
  res.json({ success: true, data: NIFTY_50_STOCKS });
});

app.get('/api/stock/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching price for:', symbol);
    
    try {
      const price = await nseDataService.getCurrentPrice(symbol);
      res.json({ success: true, data: price });
    } catch (apiError) {
      console.error('Yahoo Finance API error:', apiError.message);
      
      // Fallback to mock data if API fails
      const mockPrice = {
        symbol: symbol,
        price: 3500 + Math.random() * 500,
        change: (Math.random() - 0.5) * 100,
        changePercent: (Math.random() - 0.5) * 5,
        dayHigh: 3600 + Math.random() * 400,
        dayLow: 3400 + Math.random() * 400,
        previousClose: 3500,
        volume: 1000000 + Math.random() * 5000000,
        marketCap: 100000000000
      };
      
      console.log('Using mock data for', symbol);
      res.json({ 
        success: true, 
        data: mockPrice,
        note: 'Using simulated data - Yahoo Finance API unavailable'
      });
    }
  } catch (error) {
    console.error('Error in price endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stock/signal', async (req, res) => {
  try {
    const { symbol, name, sector } = req.body;
    console.log('Analyzing signal for:', symbol, name, sector);
    
    try {
      const candles = await nseDataService.getStockData(symbol, '1d', '5m');
      
      if (!candles || candles.length < 50) {
        throw new Error('Insufficient data for analysis');
      }
      
      const signal = indianSignalEngine.analyzeStock(candles, { symbol, name, sector });
      
      if (!signal) {
        return res.json({ 
          success: false, 
          message: 'No strong signal detected. HOLD recommended.' 
        });
      }
      
      res.json({ success: true, data: signal });
    } catch (apiError) {
      console.error('Analysis error:', apiError.message);
      
      // Generate a basic signal with mock data
      const currentPrice = 3500 + Math.random() * 500;
      const mockSignal = {
        symbol: symbol,
        name: name || symbol,
        sector: sector || 'Technology',
        action: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entry: currentPrice,
        stopLoss: currentPrice * 0.97,
        targets: [
          currentPrice * 1.02,
          currentPrice * 1.05,
          currentPrice * 1.08
        ],
        confidence: 60 + Math.floor(Math.random() * 20),
        reason: 'Technical analysis based on price action and volume (simulated data)',
        timeframe: '5m',
        duration: '1-4 hours',
        patterns: ['Price Action', 'Volume Analysis'],
        indicators: {
          rsi: 45 + Math.random() * 20,
          macd: { histogram: (Math.random() - 0.5) * 10 },
          ema: {
            ema20: currentPrice * 0.98,
            ema50: currentPrice * 0.96
          },
          volume: 'High'
        },
        riskReward: '1:2.5',
        timestamp: Date.now()
      };
      
      console.log('Using mock signal for', symbol);
      res.json({ 
        success: true, 
        data: mockSignal,
        note: 'Using simulated analysis - Yahoo Finance API unavailable'
      });
    }
  } catch (error) {
    console.error('Error in signal endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/index/nifty50', async (req, res) => {
  try {
    try {
      const nifty = await nseDataService.getNifty50Index();
      res.json({ success: true, data: nifty });
    } catch (apiError) {
      // Fallback mock data
      const mockNifty = {
        symbol: 'NIFTY 50',
        price: 21500 + Math.random() * 500,
        change: (Math.random() - 0.5) * 200,
        changePercent: (Math.random() - 0.5) * 2
      };
      res.json({ success: true, data: mockNifty, note: 'Using simulated data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/index/sensex', async (req, res) => {
  try {
    try {
      const sensex = await nseDataService.getSensexIndex();
      res.json({ success: true, data: sensex });
    } catch (apiError) {
      // Fallback mock data
      const mockSensex = {
        symbol: 'SENSEX',
        price: 71000 + Math.random() * 1000,
        change: (Math.random() - 0.5) * 500,
        changePercent: (Math.random() - 0.5) * 2
      };
      res.json({ success: true, data: mockSensex, note: 'Using simulated data' });
    }
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
