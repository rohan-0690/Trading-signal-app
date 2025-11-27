require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const { NIFTY_50_STOCKS } = require('./config/nifty50');
const { POPULAR_STOCKS, STOCK_ALIASES } = require('./config/popularStocks');
const NSEDataService = require('./services/nseDataService');
const IndianStockSignalEngine = require('./services/indianStockSignalEngine');
const OptionsCalculator = require('./services/optionsCalculator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indian-stocks')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Services
const nseDataService = new NSEDataService();
const signalEngine = new IndianStockSignalEngine();
const optionsCalculator = new OptionsCalculator();

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('📱 New client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        ws.symbol = data.symbol;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function broadcastUpdate(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes

// Get Nifty 50 stocks list
app.get('/api/nifty50/stocks', (req, res) => {
  res.json({ success: true, data: NIFTY_50_STOCKS });
});

// Get all popular stocks (Nifty 50 + Popular)
app.get('/api/stocks/all', (req, res) => {
  const allStocks = [...NIFTY_50_STOCKS, ...POPULAR_STOCKS];
  res.json({ success: true, data: allStocks, total: allStocks.length });
});

// Search stocks by name or symbol
app.get('/api/stocks/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [], message: 'Query too short' });
    }
    
    const query = q.toLowerCase().trim();
    const allStocks = [...NIFTY_50_STOCKS, ...POPULAR_STOCKS];
    
    const results = allStocks.filter(stock => 
      stock.name.toLowerCase().includes(query) ||
      stock.symbol.toLowerCase().includes(query) ||
      stock.sector.toLowerCase().includes(query)
    );
    
    res.json({ 
      success: true, 
      data: results.slice(0, 20),
      total: results.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve stock symbol (handle aliases)
app.get('/api/stocks/resolve/:symbol', (req, res) => {
  try {
    let { symbol } = req.params;
    symbol = symbol.toUpperCase();
    
    // Check if it's an alias
    if (STOCK_ALIASES[symbol]) {
      symbol = STOCK_ALIASES[symbol];
    }
    
    // If no suffix, add .NS
    if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      symbol = `${symbol}.NS`;
    }
    
    res.json({ success: true, data: { symbol } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current price for a stock
app.get('/api/stock/price/:symbol', async (req, res) => {
  try {
    let { symbol } = req.params;
    symbol = symbol.toUpperCase();
    
    // Check if it's an alias and resolve it
    if (STOCK_ALIASES[symbol]) {
      symbol = STOCK_ALIASES[symbol];
    }
    
    // Don't add .NS suffix for crypto (contains -USD, -USDT, etc.)
    const isCrypto = symbol.includes('-USD') || symbol.includes('-USDT') || 
                     symbol.includes('-BTC') || symbol.includes('-ETH');
    
    // If no suffix and not crypto, add .NS
    if (!isCrypto && !symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      symbol = `${symbol}.NS`;
    }
    
    const price = await nseDataService.getCurrentPrice(symbol);
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stock data (candles)
app.get('/api/stock/data/:symbol', async (req, res) => {
  try {
    let { symbol } = req.params;
    symbol = symbol.toUpperCase();
    
    // Check if it's an alias and resolve it
    if (STOCK_ALIASES[symbol]) {
      symbol = STOCK_ALIASES[symbol];
    }
    
    // Don't add .NS suffix for crypto
    const isCrypto = symbol.includes('-USD') || symbol.includes('-USDT') || 
                     symbol.includes('-BTC') || symbol.includes('-ETH');
    
    // If no suffix and not crypto, add .NS
    if (!isCrypto && !symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      symbol = `${symbol}.NS`;
    }
    
    const { period = '1d', interval = '5m' } = req.query;
    const candles = await nseDataService.getStockData(symbol, period, interval);
    res.json({ success: true, data: candles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate trading signal for a stock
app.post('/api/stock/signal', async (req, res) => {
  try {
    let { symbol, name, sector } = req.body;
    symbol = symbol.toUpperCase();
    
    // Check if it's an alias and resolve it
    if (STOCK_ALIASES[symbol]) {
      symbol = STOCK_ALIASES[symbol];
    }
    
    // Don't add .NS suffix for crypto
    const isCrypto = symbol.includes('-USD') || symbol.includes('-USDT') || 
                     symbol.includes('-BTC') || symbol.includes('-ETH');
    
    // If no suffix and not crypto, add .NS
    if (!isCrypto && !symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      symbol = `${symbol}.NS`;
    }
    
    const candles = await nseDataService.getStockData(symbol, '1d', '5m');
    const signal = signalEngine.analyzeStock(candles, { symbol, name, sector });
    
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

// Get signals for all Nifty 50 stocks
app.get('/api/nifty50/signals', async (req, res) => {
  try {
    const signals = [];
    
    // Analyze first 10 stocks (to avoid rate limiting)
    const stocksToAnalyze = NIFTY_50_STOCKS.slice(0, 10);
    
    for (const stock of stocksToAnalyze) {
      try {
        const candles = await nseDataService.getStockData(stock.symbol, '1d', '5m');
        const signal = signalEngine.analyzeStock(candles, stock);
        
        if (signal && signal.action !== 'HOLD') {
          signals.push(signal);
        }
      } catch (error) {
        console.error(`Error analyzing ${stock.symbol}:`, error.message);
      }
    }
    
    res.json({ success: true, data: signals, total: signals.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Nifty 50 index data
app.get('/api/index/nifty50', async (req, res) => {
  try {
    const nifty = await nseDataService.getNifty50Index();
    res.json({ success: true, data: nifty });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Sensex index data
app.get('/api/index/sensex', async (req, res) => {
  try {
    const sensex = await nseDataService.getSensexIndex();
    res.json({ success: true, data: sensex });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get NIFTY options chain
app.get('/api/options/chain', async (req, res) => {
  try {
    const nifty = await nseDataService.getNifty50Index();
    const spotPrice = nifty.price;
    const strikeRange = parseInt(req.query.range) || 10;
    
    const optionChain = optionsCalculator.getOptionChain(spotPrice, strikeRange);
    
    res.json({ 
      success: true, 
      data: optionChain,
      message: 'Live option chain data'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific option premium
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

// Get top signals (best opportunities)
app.get('/api/signals/top', async (req, res) => {
  try {
    const signals = [];
    
    for (const stock of NIFTY_50_STOCKS.slice(0, 15)) {
      try {
        const candles = await nseDataService.getStockData(stock.symbol, '1d', '5m');
        const signal = signalEngine.analyzeStock(candles, stock);
        
        if (signal && signal.confidence >= 75) {
          signals.push(signal);
        }
      } catch (error) {
        console.error(`Error analyzing ${stock.symbol}:`, error.message);
      }
    }
    
    // Sort by confidence
    signals.sort((a, b) => b.confidence - a.confidence);
    
    res.json({ 
      success: true, 
      data: signals.slice(0, 5),
      message: 'Top 5 trading opportunities'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real-time monitoring (runs every 2 minutes)
setInterval(async () => {
  try {
    const randomStock = NIFTY_50_STOCKS[Math.floor(Math.random() * NIFTY_50_STOCKS.length)];
    const candles = await nseDataService.getStockData(randomStock.symbol, '1d', '5m');
    const signal = signalEngine.analyzeStock(candles, randomStock);
    
    if (signal && signal.confidence >= 75) {
      broadcastUpdate({
        type: 'new_signal',
        data: signal
      });
    }
  } catch (error) {
    console.error('Monitoring error:', error.message);
  }
}, 120000); // Every 2 minutes

const PORT = process.env.PORT || 5001;

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`🚀 NSE/BSE Trading Signal Server running on port ${PORT}`);
    console.log(`📊 Monitoring ${NIFTY_50_STOCKS.length} Nifty 50 stocks`);
  });
}

module.exports = app;
