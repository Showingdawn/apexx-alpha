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
      if (!auth.currentUser) { setLoading(false); return; }
      try {
        const token = await auth.currentUser.getIdToken();
        const res   = await axios.get("http://localhost:3001/api/trade/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sorted = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setTrades(sorted);
      } catch (e) {
        console.error("Failed to fetch trades:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  const stats = useMemo(() => calcStats(trades), [trades]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#eaecef]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
              <Activity size={18} className="text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
                Performance DNA
              </h1>
              <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-black">
                Zerodha Console · Statistical Edge Analysis
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-[#D4AF37]/40 to-transparent mt-4" />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        ) : !stats ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a]">
              <BarChart3 size={40} className="text-gray-700 mx-auto mb-4" />
              <h2 className="text-white font-black text-lg mb-2">No Closed Trades Yet</h2>
              <p className="text-gray-600 text-sm max-w-sm">
                Execute and close some trades to generate your Performance DNA report.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* ─── 6-metric KPI grid ─── */}
            <div>
              <h2 className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black mb-4">Core Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <DnaCard icon={TrendingUp}  label="Profit Factor"    value={stats.profitFactor}     sub={`${stats.grossProfit} gross profit`} color="text-[#D4AF37]" accent />
                <DnaCard icon={Activity}    label="Sharpe Ratio"     value={stats.sharpe}            sub="Risk-adjusted returns"  color={parseFloat(stats.sharpe) >= 1 ? "text-[#00FF94]" : "text-[#FF3131]"} />
                <DnaCard icon={ShieldAlert} label="Recovery Factor"  value={stats.recoveryFactor}   sub={`Max DD: $${stats.maxDrawdown}`} color="text-blue-400" />
                <DnaCard icon={Target}      label="Win Rate"         value={`${stats.winRate}%`}     sub={`${stats.totalTrades} closed trades`} color={parseFloat(stats.winRate) >= 50 ? "text-[#00FF94]" : "text-[#FF3131]"} />
                <DnaCard icon={Award}       label="Best Trade"       value={`$${stats.best}`}        sub="Largest single win" color="text-[#00FF94]" />
                <DnaCard icon={Clock}       label="Avg Duration"     value={`${stats.avgDuration}m`} sub="Per trade session" color="text-gray-400" />
              </div>
            </div>

            {/* ─── Equity Curve ─── */}
            <div className="glass-panel p-6 border-white/5">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-[11px] text-white font-black uppercase tracking-widest">Equity Curve</h2>
                  <p className="text-[9px] text-gray-600 mt-0.5">Cumulative P&L across all closed trades</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${parseFloat(stats.netProfit) >= 0 ? "text-[#00FF94]" : "text-[#FF3131]"}`}
                    style={{ fontFamily: "'Roboto Mono', monospace" }}>
                    {parseFloat(stats.netProfit) >= 0 ? "+" : ""}${stats.netProfit}
                  </p>
                  <p className="text-[9px] text-gray-600">Net Profit</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.equityCurve} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="idx" tick={{ fill: "#555", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<EqTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#D4AF37"
                    strokeWidth={1.5}
                    fill="url(#eqGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#D4AF37", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ─── Breakdown Stats ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Gross Profit",  value: `$${stats.grossProfit}`, color: "text-[#00FF94]" },
                { label: "Gross Loss",    value: `-$${stats.grossLoss}`,  color: "text-[#FF3131]" },
                { label: "Max Drawdown",  value: `$${stats.maxDrawdown}`, color: "text-blue-400"  },
                { label: "Worst Trade",   value: `$${stats.worst}`,       color: "text-[#FF3131]" },
              ].map(item => (
                <div key={item.label} className="dna-stat-card">
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black">{item.label}</p>
                  <p className={`text-2xl font-black mt-1 ${item.color}`} style={{ fontFamily: "'Roboto Mono', monospace" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ─── Trade Log ─── */}
            <div className="glass-panel border-white/5">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-[11px] text-white font-black uppercase tracking-widest">Trade Log</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[8px] text-gray-600 uppercase tracking-widest border-b border-white/5">
                      {["Asset", "Type", "Lot", "Entry", "P&L", "Fees", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-black">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...trades].reverse().slice(0, 20).map(trade => {
                      const pnl = parseFloat(trade.pnl) || 0;
                      return (
                        <tr key={trade.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-3 text-white font-black text-[11px]">{trade.asset}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${trade.type === "BUY" ? "bg-[#00FF94]/10 text-[#00FF94]" : "bg-[#FF3131]/10 text-[#FF3131]"}`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-400 font-mono text-[11px]">{trade.lot}</td>
                          <td className="px-5 py-3 text-gray-400 font-mono text-[11px]">${(trade.entryPrice ?? 0).toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <span className={`font-black font-mono text-[11px] ${pnl >= 0 ? "text-[#00FF94]" : "text-[#FF3131]"}`}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#FF3131] font-mono text-[10px]">
                            {trade.fees ? `-$${trade.fees.total.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                              trade.status === "OPEN" ? "text-[#D4AF37] border-[#D4AF37]/30" :
                              trade.status === "CLOSED" ? "text-gray-500 border-gray-700/30" :
                              "text-yellow-500 border-yellow-500/30"
                            }`}>{trade.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
