export function initializeWebSocket(wss) {
  wss.on('connection', (ws) => {
    console.log('✅ Client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe') {
          ws.symbol = data.symbol;
          ws.timeframe = data.timeframe;
          console.log(`📊 Subscribed to ${data.symbol} ${data.timeframe}`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('❌ Client disconnected');
    });
  });
}

export function broadcastSignal(wss, signal) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'signal',
        data: signal
      }));
    }
  });
}

export function broadcastPrice(wss, symbol, price) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.symbol === symbol) {
      client.send(JSON.stringify({
        type: 'price',
        symbol,
        price
      }));
    }
  });
}
