# APEX ALPHA: Institutional Educational & Proprietary Trading Suite

**Apex Alpha** is a state-of-the-art, high-fidelity institutional simulation and proprietary trading academy desk. Engineered in Next.js 14 (App Router) and structured with a strict, hyper-premium **Sovereign Elite (Amber-on-Charcoal)** aesthetic system, Apex Alpha is designed to groom speculators in technical execution, quantitative analysis, behavioral risk control, and algorithmic operations.

---

## 🌟 Core Architecture & Feature Matrix

### 🧠 1. Heuristic Sentinel Engine & Overlays
Located inside [patterns.js](file:///Users/raghavdua/Desktop/apexalpha/utils/patterns.js) and [AlphaSentinel.jsx](file:///Users/raghavdua/Desktop/apexalpha/components/AlphaSentinel.jsx), the Sentinel is a client-side cognitive model running on local $OHLC$ mathematical arrays:
* **Pattern Recognition Engine**: Real-time client-side math detects Single (*Hammer*, *Doji*, *Marubozu*), Double (*Bullish/Bearish Engulfing*, *Tweezer Tops/Bottoms*), and Triple (*Morning Star*, *Evening Star*) candlestick formulations.
* **Support & Resistance Locator**: Hardcoded algorithmic mapping analyzing peak distribution densities of local price wicks to render dynamic S&R boundary overlays.
* **Tactical Briefing & Timeframes**: Propagated via centralized state from the trade floor [page.js](file:///Users/raghavdua/Desktop/apexalpha/app/trade/page.js), the dashboard switches its tactical educational instruction sets and briefings automatically as timeframes change from 1m (scalping parameters) to 1D (positional distribution).

### 📊 2. Strategic Post-Mortem AI Audit Room (`/audit`)
A dual-panel forensic mentorship terminal designed to review local paper trades:
* **Interactive Chatbot (Left Panel)**: A specialized risk advisor powered by tailored prompts, providing real-time psychological guidance and strategic re-calibration.
* **Forensic Ledger Audit (Right Panel)**: Pulls active trading logs from `localStorage` (`apex_local_trades`) and grades execution automatically (Grades A+ to F). Generates explicit warning banners on high leverage, absent stop-losses, and lists remedial actionable guidance.

### 📈 3. Performance DNA & Yield Analytics (`/performance`)
Calculates real-time Sharpe Ratios, Profit Factors, Win Rates, Best/Worst trades, and plots a high-performance **Cumulative Yield Equity Curve** to track trader performance metrics over time.

### 🎮 4. Gamified RPG Progression & Rank Perks
Includes a dedicated **Quests & Tasks Tab** and **Sovereign Rank Perks Grid** on the private `/profile` page:
* **Active Quests**: 6 strategic challenges (including Sharpe Optimizer and Psychology Shield) designed to incentivize strategic trading disciplines.
* **Claimable XP**: Successful quest completions trigger a dual-oscillator **Synthesized Coin SFX arpeggio** (Web Audio API) and award XP towards leveling up (from *Novice Speculator* up to *Quantum Market Maker*).
* **Perk Tiers**: Unlocking levels lowers leverage commission fees and unlocks advanced algetronic reference signals in real-time.

---

## 📂 Project Structure

```bash
├── app/                  # Next.js 14 App Router Page Components
│   ├── audit/            # AI Mentor Room & Forensic Audit Suite
│   ├── performance/      # Performance DNA & Cumulative Yield Curve
│   ├── profile/          # Private Profile Command Center, Quests, & Perks Grid
│   ├── trade/            # Core Widescreen Trade Floor & Centralized State
│   ├── page.js           # Launch gateway / Welcome Terminal
│   └── layout.js         # Core layout and typeface providers
├── components/           # Reusable Modular UI Components
│   ├── AlphaSentinel.jsx # Heuristic Sentinel Engine UI overlay
│   ├── Chart.jsx         # Custom candle plotter, briefings, and overlay toggles
│   ├── TopBarTicker.jsx  # Robust fallback-enabled ticker bar
│   └── ClientSetup.jsx   # Axios interceptor for handled dev warning silencing
├── utils/                # Helper Libraries and Pure Logic Modules
│   ├── patterns.js       # Mathematical Pattern Recognitions, S&R, & Briefings
│   └── sound.js          # Web Audio Synthesizer (Coin SFX and clicks)
└── docs/                 # Power BI Linkage & Advanced System Guides
```

---

## 🛠️ Installation & Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/raghavdua2006/Alpha-apex.git
   cd Alpha-apex
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Next.js Dev Server**:
   ```bash
   npm run dev
   ```

4. **Run the Backend Services** (for persistent accounts, optional):
   ```bash
   cd backend
   npm run dev
   ```

---

## 📊 Connecting Power BI (Strategic Audit Linkage)
For advanced quantitative reporting, traders can export their local trade ledger as a structured CSV via the **Sovereign Vault (`/portfolio`)** and load it into **Power BI Desktop (Laptop 2)** to run complete multi-dimensional risk audits. 

For step-by-step setup, refer to the [Power BI Integration Guide](file:///Users/raghavdua/Desktop/apexalpha/docs/PowerBI_Guide.md).
