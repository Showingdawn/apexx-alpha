import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

export class MarketDataService {
  /**
   * Symbol Mapper to handle NSE, Crypto, and Commodities
   */
  static mapSymbol(symbol: string): string {
    const map: Record<string, string> = {
      'Nifty 50': '^NSEI',
      'Bank Nifty': '^NSEBANK',
      'Gold': 'GC=F',
      'Crude Oil': 'CL=F',
      'BTC-USD': 'BTC-USD',
      'ETH-USD': 'ETH-USD',
      'RELIANCE': 'RELIANCE.NS',
      'TCS': 'TCS.NS',
      'HDFC BANK': 'HDFCBANK.NS',
      'INFOSYS': 'INFY.NS',
      'ICICI BANK': 'ICICIBANK.NS',
      'APPLE': 'AAPL',
      'TESLA': 'TSLA',
      'NVIDIA': 'NVDA',
      'MICROSOFT': 'MSFT',
      'GOOGLE': 'GOOGL',
      'AMAZON': 'AMZN',
      'S&P 500': '^GSPC',
      'NASDAQ 100': '^IXIC',
      'DOW JONES': '^DJI',
      'USD/INR': 'USDINR=X'
    };
    return map[symbol] || symbol;
  }

  /**
   * Fetches real-time quote data normalized for the dashboard
   */
  static async getMarketSnapshot(symbol: string) {
    try {
      const mapped = this.mapSymbol(symbol);
      
      console.log(`[MarketDataService] Fetching: Symbol=${symbol}, Mapped=${mapped}`);
      
      const quote: any = await yahooFinance.quote(mapped);
      
      if (!quote) {
        console.warn(`[MarketDataService] No quote found for ${mapped}`);
        return null;
      }

      let sparklineData: any[] = [];
      try {
        // Fetch 7-day historical for sparkline
        const history: any = await yahooFinance.chart(mapped, { 
          period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          interval: '1d'
        });

        if (history && history.quotes) {
          sparklineData = (history.quotes as any[]).map(q => ({
            date: q.date,
            price: q.close
          })).filter(q => q.price !== null);
        }
      } catch (chartError) {
        console.warn(`[MarketDataService] Chart fetch failed for ${mapped}, returning quote only.`, chartError);
      }

      return {
        symbol: mapped,
        name: quote.shortName || quote.displayName || mapped,
        price: quote.regularMarketPrice,
        changePercent: quote.regularMarketChangePercent,
        marketState: quote.marketState, // REGULAR, CLOSED, PRE, POST
        volume: quote.regularMarketVolume,
        averageVolume: quote.averageDailyVolume10Day,
        quoteType: quote.quoteType,
        recommendationMean: quote.averageAnalystRating || quote.recommendationMean,
        sparklineData
      };
    } catch (error) {
      console.error(`[MarketDataService] Yahoo Finance error for ${symbol}:`, error);
      
      // High Performance Fallback for Demo/Stress scenarios
      if (symbol === '^NSEI' || symbol === 'Nifty 50') {
         return {
           symbol: '^NSEI', name: 'Nifty 50 (Fallback)', price: 22450.75, changePercent: -0.12, 
           marketState: 'REGULAR', volume: 250000000, averageVolume: 240000000, sparklineData: []
         };
      }
      if (symbol === 'BTC-USD') {
        return {
          symbol: 'BTC-USD', name: 'Bitcoin (Fallback)', price: 68420.50, changePercent: 1.45, 
          marketState: 'REGULAR', volume: 35000000000, averageVolume: 32000000000, sparklineData: []
        };
      }

      return null;
    }
  }

  /**
   * Searches for assets across all markets (NSE, US, Crypto)
   */
  static async searchAssets(query: string) {
    try {
      const results: any = await yahooFinance.search(query);
      return results.quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
        type: q.quoteType
      }));
    } catch (error) {
      console.error(`[MarketDataService] Search failed for ${query}:`, error);
      return [];
    }
  }

  /**
   * Fetches the active literal price for a basket of global assets
   */
  static async getBatchPrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    try {
      const mappedSymbols = symbols.map(s => this.mapSymbol(s));
      const response = await yahooFinance.quote(mappedSymbols);
      const quotes: any[] = Array.isArray(response) ? response : [response];
      
      for (const symbol of symbols) {
        const mapped = this.mapSymbol(symbol);
        const found = quotes.find(q => q.symbol === mapped);
        if (found && found.regularMarketPrice) {
          prices[symbol] = found.regularMarketPrice;
        }
      }
    } catch (error) {
      console.warn("Yahoo Finance bulk fetch failed:", error);
    }
    return prices;
  }
}
