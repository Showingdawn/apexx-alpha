"use client";
import { useEffect, useState, useMemo } from "react";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  TrendingUp, TrendingDown, Target, ShieldAlert, Zap,
  BarChart3, Clock, Award, Activity
} from "lucide-react";

// ─── Stat calculation helpers ──────────────────────────────
function calcStats(trades) {
  const closed = trades.filter(t => t.status === "CLOSED" && t.pnl != null);
  if (closed.length === 0) return null;

  const pnls = closed.map(t => parseFloat(t.pnl) || 0);
  const wins  = pnls.filter(p => p > 0);
  const losses = pnls.filter(p => p < 0);

  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss   = Math.abs(losses.reduce((a, b) => a + b, 0));
  const netProfit   = grossProfit - grossLoss;
  const winRate     = (wins.length / closed.length) * 100;

  // Profit Factor
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  // Sharpe Ratio (simplified, 0% risk-free rate)
  const avgReturn  = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const variance   = pnls.reduce((s, p) => s + (p - avgReturn) ** 2, 0) / pnls.length;
  const stdDev     = Math.sqrt(variance);
  const sharpe     = stdDev === 0 ? 0 : avgReturn / stdDev;

  // Max Drawdown
  let peak = 0, maxDD = 0, running = 0;
  pnls.forEach(p => {
    running += p;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDD) maxDD = dd;
  });

  // Recovery Factor
  const recoveryFactor = maxDD === 0 ? netProfit : netProfit / maxDD;

  // Average trade duration
  const durations = closed
    .filter(t => t.closedAt || t.exitPrice)
    .map(t => {
      const open  = new Date(t.createdAt).getTime();
      const close = t.closedAt ? new Date(t.closedAt).getTime() : Date.now();
      return (close - open) / 60000; // minutes
    });
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  // Best / Worst
  const best  = Math.max(...pnls);
  const worst = Math.min(...pnls);

  // Equity curve
  let equity = 0;
  const equityCurve = closed.map((t, i) => {
    equity += parseFloat(t.pnl) || 0;
    return {
      idx: i + 1,
      equity: parseFloat(equity.toFixed(2)),
      label: t.asset,
    };
  });

  return {
    totalTrades: closed.length,
    winRate: winRate.toFixed(1),
    profitFactor: profitFactor.toFixed(2),
    sharpe: sharpe.toFixed(2),
    maxDrawdown: maxDD.toFixed(2),
    recoveryFactor: recoveryFactor.toFixed(2),
    netProfit: netProfit.toFixed(2),
    avgDuration: avgDuration.toFixed(0),
    best: best.toFixed(2),
    worst: worst.toFixed(2),
    equityCurve,
    grossProfit: grossProfit.toFixed(2),
    grossLoss: grossLoss.toFixed(2),
  };
}

// ─── DNA Stat Card ─────────────────────────────────────────
function DnaCard({ icon: Icon, label, value, sub, color = "text-white", accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`dna-stat-card flex flex-col gap-2 ${accent ? "border-[#D4AF37]/30" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
          <Icon size={13} />
        </div>
        <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black">{label}</span>
      </div>
      <p className={`text-3xl font-black ${color}`} style={{ fontFamily: "'Roboto Mono', monospace" }}>
        {value}
      </p>
      {sub && <p className="text-[9px] text-gray-600 font-bold">{sub}</p>}
    </motion.div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────
function EqTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-xl px-3 py-2 shadow-2xl">
      <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Cumulative P&L</p>
      <p className={`text-[13px] font-black ${val >= 0 ? "text-[#00FF94]" : "text-[#FF3131]"}`}
        style={{ fontFamily: "'Roboto Mono', monospace" }}>
        {val >= 0 ? "+" : ""}${val}
      </p>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────
export default function PerformancePage() {
  const [trades, setTrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      let tradesArray = [];

      // 1. Load active paper trading data from localStorage
      const localTrades = localStorage.getItem("apex_local_trades");
      if (localTrades) {
        try {
          tradesArray = JSON.parse(localTrades);
        } catch (e) {
          console.error("Failed parsing local trades inside Performance", e);
        }
      }

      // 2. Fetch backend trades if user is authenticated
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const res   = await axios.get("http://localhost:3001/api/trade/history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data && res.data.length > 0) {
            // Deduplicate by ID
            const existingIds = new Set(tradesArray.map(t => t.id));
            const uniqueBackend = res.data.filter(t => !existingIds.has(t.id));
            tradesArray = [...tradesArray, ...uniqueBackend];
          }
        } catch (e) {
          console.error("Failed to fetch backend trades:", e);
        }
      }

      const sorted = tradesArray.sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp));
      setTrades(sorted);
      setLoading(false);
    };
    fetchTrades();
  }, []);

  const stats = useMemo(() => calcStats(trades), [trades]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-body selection:bg-[#f0c040]/30 selection:text-white">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50"
      >
        <Navbar />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto px-6 py-12"
      >
        {/* Page title */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 border border-[#f0c040]/30 text-[#f0c040]">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-header font-black tracking-[0.1em] uppercase">
                Performance Audit
              </h1>
              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] mt-1">
                Institutional Statistical Edge Analysis
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[#f0c040]/40 to-transparent mt-6" />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-10 h-10 border border-[#f0c040]/30 border-t-[#f0c040] rounded-none animate-spin" />
          </div>
        ) : !stats ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="p-12 glass-panel border-white/10">
              <BarChart3 size={48} className="text-gray-800 mx-auto mb-6" />
              <h2 className="text-white font-header font-black text-lg mb-2 uppercase tracking-widest">Awaiting Alpha Data</h2>
              <p className="text-gray-600 text-[11px] max-w-sm font-mono uppercase tracking-widest leading-loose">
                Terminate active positions to generate proprietary performance DNA reports.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* ─── 6-metric KPI grid ─── */}
            <motion.div variants={itemVariants}>
              <h2 className="text-[10px] text-gray-500 font-header font-black uppercase tracking-[0.4em] mb-6">Quantum Core Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <DnaCard icon={TrendingUp}  label="Profit Factor"    value={stats.profitFactor}     sub={`${stats.grossProfit} gross profit`} color="text-[#f0c040]" accent />
                <DnaCard icon={Activity}    label="Sharpe Ratio"     value={stats.sharpe}            sub="Risk-adjusted returns"  color={parseFloat(stats.sharpe) >= 1 ? "text-[#00e676]" : "text-[#ff1744]"} />
                <DnaCard icon={ShieldAlert} label="Recovery Factor"  value={stats.recoveryFactor}   sub={`Max DD: $${stats.maxDrawdown}`} color="text-blue-400" />
                <DnaCard icon={Target}      label="Win Rate"         value={`${stats.winRate}%`}     sub={`${stats.totalTrades} closed trades`} color={parseFloat(stats.winRate) >= 50 ? "text-[#00e676]" : "text-[#ff1744]"} />
                <DnaCard icon={Award}       label="Best Trade"       value={`$${stats.best}`}        sub="Largest single win" color="text-[#00e676]" />
                <DnaCard icon={Clock}       label="Avg Duration"     value={`${stats.avgDuration}m`} sub="Per trade session" color="text-gray-500" />
              </div>
            </motion.div>

            {/* ─── Equity Curve ─── */}
            <motion.div variants={itemVariants} className="glass-panel p-8 border-white/10 overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] scanlines" />
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-[11px] text-white font-header font-black uppercase tracking-[0.2em]">Sovereign Equity Curve</h2>
                  <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Cumulative Yield Matrix</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-mono font-black ${parseFloat(stats.netProfit) >= 0 ? "text-[#00e676]" : "text-[#ff1744]"}`}>
                    {parseFloat(stats.netProfit) >= 0 ? "+" : ""}${stats.netProfit}
                  </p>
                  <p className="text-[10px] text-gray-600 font-header font-black uppercase tracking-widest">Net Realized P&L</p>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.equityCurve} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f0c040" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f0c040" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="idx" hide />
                    <YAxis tick={{ fill: "#333", fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<EqTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#f0c040"
                      strokeWidth={2}
                      fill="url(#eqGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#f0c040", strokeWidth: 0, shadowBlur: 10, shadowColor: "#f0c040" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* ─── Breakdown Stats ─── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Gross Profit",  value: `$${stats.grossProfit}`, color: "text-[#00e676]" },
                { label: "Gross Loss",    value: `-$${stats.grossLoss}`,  color: "text-[#ff1744]" },
                { label: "Max Drawdown",  value: `$${stats.maxDrawdown}`, color: "text-blue-400"  },
                { label: "Worst Trade",   value: `$${stats.worst}`,       color: "text-[#ff1744]" },
              ].map(item => (
                <div key={item.label} className="glass-panel p-6 border-white/5 bg-white/[0.02] hover:border-[#f0c040]/30 transition-all">
                  <p className="text-[9px] text-gray-600 font-header font-black uppercase tracking-[0.2em]">{item.label}</p>
                  <p className={`text-2xl font-mono font-black mt-2 ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* ─── Trade Log (The Elite List) ─── */}
            <motion.div variants={itemVariants} className="glass-panel border-white/10 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-[11px] text-white font-header font-black uppercase tracking-[0.2em]">Verified Audit Log</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[9px] text-gray-600 font-header font-black uppercase tracking-[0.2em] border-b border-white/5">
                      {["Asset", "Type", "Lot", "Entry", "P&L Delta", "Fees", "Audit State"].map(h => (
                        <th key={h} className="px-6 py-5 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...trades].reverse().slice(0, 30).map(trade => {
                      const pnl = parseFloat(trade.pnl) || 0;
                      return (
                        <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                          <td className="px-6 py-4 text-white font-header font-black text-[11px] group-hover:text-[#f0c040] transition-colors">{trade.asset}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-header font-black uppercase px-3 py-1 rounded-none border ${trade.type === "BUY" ? "border-[#00e676]/30 text-[#00e676] bg-[#00e676]/5" : "border-[#ff1744]/30 text-[#ff1744] bg-[#ff1744]/5"}`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">{trade.lot}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">${(trade.entryPrice ?? 0).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`font-mono font-black text-[11px] ${pnl >= 0 ? "text-[#00e676]" : "text-[#ff1744]"}`}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#ff1744]/60 font-mono text-[10px]">
                            {trade.fees ? `-$${trade.fees.total.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-header font-black uppercase px-3 py-1 border ${
                              trade.status === "OPEN" ? "text-[#f0c040] border-[#f0c040]/30 bg-[#f0c040]/5" :
                              trade.status === "CLOSED" ? "text-gray-700 border-white/5" :
                              "text-yellow-500 border-yellow-500/30"
                            }`}>{trade.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-[0.03]" />
    </div>
  );
}
