import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import tradeRoutes from './routes/trade.routes';
import marketRoutes from './routes/market.routes';
import adminRoutes from './routes/admin.routes';
import { MarketDataService } from './services/market.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);

// Multi-Asset Polling Engine
const ASSETS = ['Nifty 50', 'Bank Nifty', 'Gold', 'Crude Oil', 'BTC-USD', 'ETH-USD', 'RELIANCE'];
let cachedPrices: Record<string, number> = {};

const pollMarketData = async () => {
  try {
    const prices = await MarketDataService.getBatchPrices(ASSETS);
    cachedPrices = prices;
    
    // Broadcast updates to all clients
    io.emit('market_update', prices);
    
    // Also emit individual updates for backward compatibility if needed
    // but the frontend should move to 'market_update'
    if (prices['BTC-USD']) {
      io.emit('price_update', { asset: 'BTC/USD', price: prices['BTC-USD'] });
    }
  } catch (error) {
    console.error("Market data polling error:", error);
  } finally {
    // Poll every 5000ms as per plan
    setTimeout(pollMarketData, 5000);
  }
};

// Start the polling loop
pollMarketData();

// Client Socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send immediate cache on connection
  socket.emit('market_update', cachedPrices);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Apex Alpha Backend Running on port ${PORT}`);
  console.log(`Market Data Engine active for: ${ASSETS.join(', ')}`);
});
