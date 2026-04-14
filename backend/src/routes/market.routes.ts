import { Router } from 'express';
import { MarketDataService } from '../services/market.service';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

const router = Router();

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    try {
      const results: any = await yahooFinance.search(query);
      return res.json(results.quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname,
        exchange: q.exchange
      })));
    } catch (e) {
      const results = await MarketDataService.searchAssets(query);
      res.json(results);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/snapshot', async (req, res) => {
  try {
    const symbol = req.query.symbol as string;
    
    if (!symbol) {
      console.warn("[MarketRoutes] Missing symbol in request");
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const data = await MarketDataService.getMarketSnapshot(symbol);
    
    if (!data) {
      console.error(`[MarketRoutes] Data failed for: ${symbol}`);
      return res.status(404).json({ error: `Market data failed for ${symbol}` });
    }

    res.json(data);
  } catch (error: any) {
    console.error(`[MarketRoutes] Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
