import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import marketRoutes from './routes/market.js';
import signalRoutes from './routes/signals.js';
import userRoutes from './routes/user.js';
import { initializeWebSocket } from './services/websocket.js';
import { startMarketMonitoring } from './services/marketMonitor.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/market', marketRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/user', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Initialize WebSocket
initializeWebSocket(wss);

// Start market monitoring
startMarketMonitoring(wss);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
