import cron from 'node-cron';
import { generateSignal } from './signalGenerator.js';
import { broadcastSignal } from './websocket.js';

const WATCHLIST = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
const TIMEFRAMES = ['5m', '15m', '1h'];

export function startMarketMonitoring(wss) {
  console.log('🔍 Starting market monitoring...');

  // Monitor every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('📊 Scanning markets...');
    
    for (const symbol of WATCHLIST) {
      for (const timeframe of TIMEFRAMES) {
        try {
          const signal = await generateSignal(symbol, timeframe);
          
          if (signal._id) {
            console.log(`🚨 New signal: ${signal.signal} ${symbol} @ ${signal.entry}`);
            broadcastSignal(wss, signal);
          }
        } catch (error) {
          console.error(`Error analyzing ${symbol}:`, error.message);
        }
      }
    }
  });
}
