# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (Port 3000)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ Dashboard  │  │ SignalCard │  │ ChartView  │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  ┌────────────┐  ┌────────────┐                          │   │
│  │  │ Watchlist  │  │RiskManager │                          │   │
│  │  └────────────┘  └────────────┘                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Node.js + Express (Port 5000)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │   Routes   │  │  Services  │  │   Models   │         │   │
│  │  │            │  │            │  │            │         │   │
│  │  │ /market    │  │ Pattern    │  │  Signal    │         │   │
│  │  │ /signals   │  │ Detector   │  │  Alert     │         │   │
│  │  │ /alerts    │  │ Technical  │  │            │         │   │
│  │  │            │  │ Analysis   │  │            │         │   │
│  │  │            │  │ Signal     │  │            │         │   │
│  │  │            │  │ Engine     │  │            │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│    DATABASE LAYER        │  │   EXTERNAL APIs          │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │     MongoDB        │  │  │  │  Binance API       │  │
│  │                    │  │  │  │  (Crypto Data)     │  │
│  │  - Signals         │  │  │  └────────────────────┘  │
│  │  - Alerts          │  │  │  ┌────────────────────┐  │
│  │  - Users           │  │  │  │ AlphaVantage API   │  │
│  │                    │  │  │  │  (Stock Data)      │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
└──────────────────────────┘  └──────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   Binance   │
│     API     │
└──────┬──────┘
       │ 1. Fetch Candles
       ▼
┌─────────────────────┐
│  Market Data        │
│  Service            │
└──────┬──────────────┘
       │ 2. Raw Candle Data
       ▼
┌─────────────────────┐
│  Pattern Detector   │
│  - Hammer           │
│  - Engulfing        │
│  - Doji, etc.       │
└──────┬──────────────┘
       │ 3. Detected Patterns
       ▼
┌─────────────────────┐
│ Technical Analysis  │
│  - RSI              │
│  - MACD             │
│  - EMA, ATR         │
└──────┬──────────────┘
       │ 4. Indicator Values
       ▼
┌─────────────────────┐
│   Signal Engine     │
│  - Score patterns   │
│  - Score indicators │
│  - Calculate conf.  │
└──────┬──────────────┘
       │ 5. Trading Signal
       ▼
┌─────────────────────┐
│     MongoDB         │
│  Store Signal       │
└──────┬──────────────┘
       │ 6. Broadcast
       ▼
┌─────────────────────┐
│   WebSocket         │
│  Push to Clients    │
└──────┬──────────────┘
       │ 7. Display
       ▼
┌─────────────────────┐
│   React Frontend    │
│  Show Signal Card   │
└─────────────────────┘
```

## Signal Generation Flow

```
Input: Candle Data (100 candles)
│
├─► Pattern Detection
│   ├─► Candlestick Patterns
│   │   ├─► Hammer → +14 points (bullish)
│   │   ├─► Engulfing → +17 points (bullish)
│   │   └─► Doji → 0 points (neutral)
│   │
│   └─► Chart Patterns
│       ├─► Double Top → -12 points (bearish)
│       └─► Triangle → +11 points (bullish)
│
├─► Technical Indicators
│   ├─► RSI (28) → +15 points (oversold)
│   ├─► MACD (bullish cross) → +10 points
│   ├─► EMA (20>50) → +10 points
│   └─► Volume (1.8x avg) → +10 points
│
├─► Trend Analysis
│   └─► Bullish trend → +12 points
│
└─► Calculate Signal
    ├─► Bullish Score: 89 points
    ├─► Bearish Score: 12 points
    ├─► Confidence: 89%
    ├─► Signal: BUY
    │
    └─► Calculate Levels
        ├─► Entry: Current Price
        ├─► Stop Loss: Entry - (ATR × 1.5)
        ├─► Target 1: Entry + (ATR × 1.5)
        ├─► Target 2: Entry + (ATR × 2.5)
        └─► Target 3: Entry + (ATR × 4.0)
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   └── Live Indicator
│
├── Dashboard (Left Sidebar)
│   ├── Stat Card (Price)
│   ├── Stat Card (24h Change)
│   ├── Stat Card (Active Signals)
│   └── Stat Card (Accuracy)
│
├── Main Content (Center)
│   ├── ChartView
│   │   ├── Timeframe Selector
│   │   └── Recharts LineChart
│   │
│   └── Signals Grid
│       └── SignalCard (multiple)
│           ├── Signal Header
│           ├── Symbol Info
│           ├── Entry/Stop/Targets
│           ├── Reason
│           └── Footer (R:R, Time)
│
└── Sidebar (Right)
    ├── Watchlist
    │   └── Watchlist Items (multiple)
    │       ├── Symbol
    │       ├── Price
    │       └── Change %
    │
    └── Risk Manager
        ├── Capital Input
        ├── Risk % Input
        ├── Leverage Input
        └── Results Display
```

## API Request Flow

```
Client Request
│
├─► GET /api/market/price/:symbol
│   └─► MarketDataService.getCurrentPrice()
│       └─► Binance API
│           └─► Return: { symbol, price }
│
├─► GET /api/market/candles/:symbol
│   └─► MarketDataService.getCandles()
│       └─► Binance API
│           └─► Return: [{ timestamp, open, high, low, close, volume }]
│
├─► POST /api/signals/generate
│   └─► SignalEngine.analyzeAndGenerateSignal()
│       ├─► PatternDetector.detectPatterns()
│       ├─► TechnicalAnalysis.getIndicators()
│       ├─► Calculate signal
│       └─► Save to MongoDB
│           └─► Return: { signal, entry, stopLoss, targets, confidence }
│
└─► GET /api/signals/accuracy
    └─► Query MongoDB
        └─► Calculate win rate
            └─► Return: { total, successful, failed, accuracy }
```

## WebSocket Communication

```
Client                          Server
  │                               │
  ├─► Connect                     │
  │   ws://localhost:5000         │
  │                               │
  ├─► Send Subscribe              │
  │   {                           │
  │     type: "subscribe",        │
  │     symbol: "BTCUSDT",        │
  │     timeframe: "5m"           │
  │   }                           │
  │                               │
  │                               ├─► Store client info
  │                               │
  │                               ├─► Every 5 seconds:
  │                               │   ├─► Fetch candles
  │                               │   ├─► Analyze patterns
  │                               │   └─► Generate signal
  │                               │
  │   ◄─── Broadcast Signal       │
  │   {                           │
  │     type: "signal",           │
  │     data: {                   │
  │       signal: "BUY",          │
  │       entry: 45320,           │
  │       ...                     │
  │     }                         │
  │   }                           │
  │                               │
  ├─► Display Signal              │
  │   Show toast notification     │
  │   Add to signals list         │
  │                               │
```

## Database Schema

```
┌─────────────────────────────────────┐
│           Signals Collection         │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ symbol: String                      │
│ timeframe: String                   │
│ signal: String (BUY/SELL/AVOID)     │
│ entry: Number                       │
│ stopLoss: Number                    │
│ targets: {                          │
│   t1: Number                        │
│   t2: Number                        │
│   t3: Number                        │
│ }                                   │
│ confidence: Number (0-100)          │
│ reason: String                      │
│ patterns: [String]                  │
│ indicators: Object                  │
│ riskReward: Number                  │
│ status: String (active/hit/expired) │
│ createdAt: Date                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           Alerts Collection          │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ userId: String                      │
│ symbol: String                      │
│ condition: String                   │
│ value: Number                       │
│ active: Boolean                     │
│ triggered: Boolean                  │
│ createdAt: Date                     │
└─────────────────────────────────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  React, CSS3, Framer Motion, Recharts  │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Application Layer               │
│  Express.js, WebSocket, Node.js         │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│  Pattern Detection, Technical Analysis  │
│  Signal Engine, Risk Calculator         │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│  Mongoose ODM, MongoDB Driver           │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Data Layer                      │
│  MongoDB Database                       │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         External Services               │
│  Binance API, AlphaVantage API          │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                   (Nginx / AWS ELB)                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│   Frontend   │          │   Frontend   │
│   Server 1   │          │   Server 2   │
│  (React App) │          │  (React App) │
└──────────────┘          └──────────────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │    API Gateway         │
        │   (Rate Limiting)      │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│   Backend    │          │   Backend    │
│   Server 1   │          │   Server 2   │
│  (Node.js)   │          │  (Node.js)   │
└──────────────┘          └──────────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│   MongoDB    │◄────────►│   MongoDB    │
│   Primary    │          │   Replica    │
└──────────────┘          └──────────────┘
        │
        ▼
┌──────────────┐
│   Backup     │
│   Storage    │
└──────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Client (Browser)                 │
└─────────────────┬───────────────────────┘
                  │ HTTPS/WSS
                  ▼
┌─────────────────────────────────────────┐
│         SSL/TLS Layer                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Firewall / WAF                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Rate Limiter                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Authentication Layer             │
│         (JWT / OAuth)                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Authorization Layer              │
│         (Role-based Access)              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Application Server               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Database (Encrypted)             │
└─────────────────────────────────────────┘
```

## Monitoring & Logging

```
Application
    │
    ├─► Application Logs
    │   └─► Winston / Morgan
    │       └─► Log Files / CloudWatch
    │
    ├─► Error Tracking
    │   └─► Sentry
    │       └─► Error Dashboard
    │
    ├─► Performance Monitoring
    │   └─► New Relic / DataDog
    │       └─► APM Dashboard
    │
    ├─► Analytics
    │   └─► Google Analytics
    │       └─► User Behavior
    │
    └─► Health Checks
        └─► /health endpoint
            └─► Uptime Monitoring
```

This architecture provides:
- ✅ Scalability (horizontal scaling)
- ✅ High availability (redundancy)
- ✅ Real-time updates (WebSocket)
- ✅ Security (multiple layers)
- ✅ Monitoring (comprehensive logging)
- ✅ Performance (optimized data flow)
