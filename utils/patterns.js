/**
 * Client-Side Candlestick Pattern Recognition Engine
 * Handles single, double, and triple patterns with institutional psychology notes.
 */

export function detectPatterns(candles) {
  if (!candles || candles.length < 3) return null;

  // We analyze the last 3 candles in the array: c0 (oldest), c1 (middle), c2 (newest)
  const c0 = candles[candles.length - 3];
  const c1 = candles[candles.length - 2];
  const c2 = candles[candles.length - 1];

  const body0 = Math.abs(c0.close - c0.open);
  const range0 = c0.high - c0.low;
  const body1 = Math.abs(c1.close - c1.open);
  const range1 = c1.high - c1.low;
  const body2 = Math.abs(c2.close - c2.open);
  const range2 = c2.high - c2.low;

  // 1. Triple Patterns
  // Three White Soldiers: Three consecutive strong bullish candles
  if (c0.close > c0.open && c1.close > c1.open && c2.close > c2.open &&
      body0 > range0 * 0.5 && body1 > range1 * 0.5 && body2 > range2 * 0.5) {
    return {
      name: "Three White Soldiers",
      sentiment: "BULLISH CONTINUATION",
      isBullish: true,
      psychology: "Aggressive, sustained buying pressure from institutional market makers clearing out supply walls."
    };
  }

  // Morning Star: Long Bearish -> Small Star -> Strong Bullish
  if (c0.close < c0.open && body0 > range0 * 0.5 &&
      body1 < range1 * 0.3 &&
      c2.close > c2.open && c2.close > (c0.open + c0.close) / 2) {
    return {
      name: "Morning Star",
      sentiment: "BULLISH REVERSAL",
      isBullish: true,
      psychology: "Sell pressure exhausted; smart money stepping in at major support to accumulate heavily."
    };
  }

  // Evening Star: Long Bullish -> Small Star -> Strong Bearish
  if (c0.close > c0.open && body0 > range0 * 0.5 &&
      body1 < range1 * 0.3 &&
      c2.close < c2.open && c2.close < (c0.open + c0.close) / 2) {
    return {
      name: "Evening Star",
      sentiment: "BEARISH REVERSAL",
      isBullish: false,
      psychology: "Distribution phase complete. Whales withdrawing bids, triggering cascading liquidations of retail longs."
    };
  }

  // 2. Double Patterns
  // Bullish Engulfing
  if (c1.close < c1.open && c2.close > c2.open && c2.close >= c1.open && c2.open <= c1.close) {
    return {
      name: "Bullish Engulfing",
      sentiment: "BULLISH REVERSAL",
      isBullish: true,
      psychology: "Aggressive absorption of all remaining retail sell orders, reversing the momentum instantly."
    };
  }

  // Bearish Engulfing
  if (c1.close > c1.open && c2.close < c2.open && c2.close <= c1.open && c2.open >= c1.close) {
    return {
      name: "Bearish Engulfing",
      sentiment: "BEARISH REVERSAL",
      isBullish: false,
      psychology: "Institutions aggressively hitting bids, overwhelming any retail support levels."
    };
  }

  // Tweezer Bottoms (Almost identical Lows)
  if (Math.abs(c1.low - c2.low) < (c1.low * 0.001)) {
    return {
      name: "Tweezer Bottom",
      sentiment: "BULLISH REVERSAL",
      isBullish: true,
      psychology: "A solid floor established by algorithms defending a key institutional block order."
    };
  }

  // Tweezer Tops (Almost identical Highs)
  if (Math.abs(c1.high - c2.high) < (c1.high * 0.001)) {
    return {
      name: "Tweezer Top",
      sentiment: "BEARISH REVERSAL",
      isBullish: false,
      psychology: "Rejection of higher prices at a major resistance cluster where market makers are executing sell orders."
    };
  }

  // 3. Single Patterns (Analyze newest candle c2)
  const upperShadow2 = c2.high - Math.max(c2.open, c2.close);
  const lowerShadow2 = Math.min(c2.open, c2.close) - c2.low;

  // Doji
  if (body2 < range2 * 0.1) {
    return {
      name: "Doji",
      sentiment: "NEUTRAL INDECISION",
      isBullish: null,
      psychology: "Perfect equilibrium between buyers and sellers; smart money waiting for a volatility catalyst."
    };
  }

  // Hammer
  if (lowerShadow2 > body2 * 2 && upperShadow2 < body2 * 0.5) {
    return {
      name: "Hammer",
      sentiment: "BULLISH REVERSAL",
      isBullish: true,
      psychology: "Aggressive absorption of sell orders. Institutional algorithms bought up the intraday panic."
    };
  }

  // Shooting Star
  if (upperShadow2 > body2 * 2 && lowerShadow2 < body2 * 0.5) {
    return {
      name: "Shooting Star",
      sentiment: "BEARISH REVERSAL",
      isBullish: false,
      psychology: "Failed breakout. Whales trapped early buyers before reversing the price downward."
    };
  }

  // Marubozu
  if (body2 > range2 * 0.9) {
    return {
      name: c2.close > c2.open ? "Bullish Marubozu" : "Bearish Marubozu",
      sentiment: c2.close > c2.open ? "BULLISH CONTINUATION" : "BEARISH CONTINUATION",
      isBullish: c2.close > c2.open,
      psychology: "Absolute dominant trend control. No resistance encountered during this entire period."
    };
  }

  return null;
}

export function calculateSupportResistance(candles) {
  if (!candles || candles.length === 0) return { resY: 20, supY: 80, resistance: 0, support: 0 };
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const spread = maxHigh - minLow || 1;
  
  const sortedHighs = [...highs].sort((a,b) => b - a);
  const sortedLows = [...lows].sort((a,b) => a - b);
  
  const resistance = sortedHighs.slice(0, 3).reduce((acc, v) => acc + v, 0) / 3;
  const support = sortedLows.slice(0, 3).reduce((acc, v) => acc + v, 0) / 3;
  
  const resY = ((maxHigh - resistance) / spread) * 100;
  const supY = ((maxHigh - support) / spread) * 100;
  
  return { resY, supY, resistance, support };
}

export const MENTOR_BRIEFINGS = {
  "1m": "Briefing: High-volatility scalping. Move quickly. Look for patterns like the 'Hammer' to buy the 'floor'.",
  "15m": "Briefing: Local trend validation. Keep stop-loss tight and monitor Break of Structure (BOS).",
  "1h": "Briefing: Local trend validation. Keep stop-loss tight and monitor Break of Structure (BOS).",
  "4h": "Briefing: Institutional trend following. Patience required. Look for 'Order Blocks' to find where major funds are entering.",
  "1D": "Briefing: Institutional trend following. Patience required. Look for 'Order Blocks' to find where major funds are entering."
};

export const BRIEFINGS = {
  "1m": "1m Timeframe engaged. Orderbook volatility is elevated. Scalping parameters active.",
  "15m": "15m Timeframe engaged. Trend confirmations required. Swing parameters active.",
  "1h": "1h Timeframe engaged. Swing indicators active. Target key liquidity sweeps.",
  "4h": "4h Timeframe engaged. Institutional order blocks detected. Macro trend active.",
  "1D": "1D Timeframe engaged. Long-term distribution matrices active."
};

// Pre-generated 15 candles to overlay on the chart for interactive scanning
export const MOCK_CHART_CANDLES = [
  { open: 100, high: 105, low: 98, close: 104 }, // 0
  { open: 104, high: 106, low: 101, close: 102 }, // 1
  { open: 102, high: 103, low: 92, close: 94 }, // 2 (Long Red)
  { open: 94, high: 95, low: 88, close: 93 }, // 3 (Hammer - Bullish Reversal)
  { open: 93, high: 101, low: 93, close: 100 }, // 4 (Bullish Engulfing)
  { open: 100, high: 104, low: 99, close: 103 }, // 5
  { open: 103, high: 112, low: 102, close: 105 }, // 6 (Shooting Star - Bearish)
  { open: 105, high: 106, low: 104.9, close: 105.1 }, // 7 (Doji)
  { open: 105.1, high: 110, low: 104.8, close: 109.5 }, // 8
  { open: 109.5, high: 114, low: 109, close: 113.8 }, // 9
  { open: 113.8, high: 118, low: 113, close: 117.5 }, // 10 (Three White Soldiers)
  { open: 117.5, high: 118, low: 110, close: 111 }, // 11
  { open: 111, high: 115, low: 111, close: 114.8 }, // 12
  { open: 114.8, high: 115, low: 105, close: 106 }, // 13 (Evening Star part 1)
  { open: 106, high: 107, low: 105.8, close: 106.1 }, // 14 (Evening Star part 2)
  { open: 106.1, high: 106.5, low: 98, close: 99 } // 15 (Evening Star part 3)
];
