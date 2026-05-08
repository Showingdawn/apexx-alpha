"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Trash2, Cpu, Plus, Sliders, Activity, Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_BOTS = [
  {
    id: "algo-1",
    name: "Nifty Momentum Sniper",
    asset: "Nifty 50",
    condition: "GAINS",
    threshold: 10,
    action: "BUY",
    lots: 1,
    status: "ACTIVE",
    triggeredCount: 0
  },
  {
    id: "algo-2",
    name: "BTC Risk Sentry",
    asset: "BTC-USD",
    condition: "DROPS",
    threshold: 2,
    action: "SELL",
    lots: 2,
    status: "PAUSED",
    triggeredCount: 0
  }
];

export default function AlgoPage() {
  const [bots, setBots] = useState([]);
  const [botName, setBotName] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("Nifty 50");
  const [condition, setCondition] = useState("GAINS");
  const [threshold, setThreshold] = useState(10);
  const [action, setAction] = useState("BUY");
  const [lots, setLots] = useState(1);
  const [logs, setLogs] = useState([]);

  // Load from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem("apex_algo_bots");
    if (saved) {
      try { setBots(JSON.parse(saved)); } catch (e) { setBots(INITIAL_BOTS); }
    } else {
      setBots(INITIAL_BOTS);
      localStorage.setItem("apex_algo_bots", JSON.stringify(INITIAL_BOTS));
    }

    setLogs([
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Algorithmic trading engine initialized successfully.`,
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Connecting to NSE & Crypto order books...`
    ]);
  }, []);

  // Sync with localStorage
  const saveBots = (updated) => {
    setBots(updated);
    localStorage.setItem("apex_algo_bots", JSON.stringify(updated));
  };

  // Live simulation ticker for executing bots
  useEffect(() => {
    const interval = setInterval(() => {
      const activeBots = bots.filter(b => b.status === "ACTIVE");
      if (activeBots.length === 0) return;

      // Select a random active bot to evaluate
      const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
      const randChange = (Math.random() * 15).toFixed(2); // Mock stock movement percent
      const hit = Number(randChange) >= bot.threshold;

      setLogs(prev => {
        const newLogs = [...prev];
        if (newLogs.length > 25) newLogs.shift();

        newLogs.push(`[${new Date().toLocaleTimeString()}] [EVAL] ${bot.name} scanning ${bot.asset} (Current delta: ${bot.condition === "GAINS" ? "+" : "-"}${randChange}%)`);
        
        if (hit) {
          newLogs.push(`[${new Date().toLocaleTimeString()}] [TRIGGERED] ${bot.name} condition met! ${bot.asset} ${bot.condition === "GAINS" ? "gained" : "dropped"} ${randChange}% (Target: ${bot.threshold}%)`);
          newLogs.push(`[${new Date().toLocaleTimeString()}] [EXECUTION] Placing ${bot.action} market order of ${bot.lots} Lot(s) on ${bot.asset}.`);
          newLogs.push(`[${new Date().toLocaleTimeString()}] [LEDGER] Order filled successfully inside Sovereign Vault ledger!`);
          
          // Increment trigger count
          const updated = bots.map(b => b.id === bot.id ? { ...b, triggeredCount: b.triggeredCount + 1 } : b);
          saveBots(updated);
          toast.success(`ALGO TRIGGERED: ${bot.name} executed ${bot.action} successfully!`);
        }
        return newLogs;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [bots]);

  const handleCreateBot = (e) => {
    e.preventDefault();
    if (!botName.trim()) {
      return toast.error("Please provide a valid Algotronic Bot name.");
    }

    const newBot = {
      id: `algo-${Date.now()}`,
      name: botName,
      asset: selectedAsset,
      condition,
      threshold: Number(threshold),
      action,
      lots: Number(lots),
      status: "ACTIVE",
      triggeredCount: 0
    };

    const updated = [...bots, newBot];
    saveBots(updated);
    setBotName("");
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [SYSTEM] Configured and deployed bot: ${newBot.name}.`]);
    toast.success(`Algotronic Bot '${newBot.name}' Engaged!`);
  };

  const toggleBotStatus = (id) => {
    const updated = bots.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [SYSTEM] ${b.name} transitioned to ${nextStatus}.`]);
        return { ...b, status: nextStatus };
      }
      return b;
    });
    saveBots(updated);
  };

  const handleDeleteBot = (id) => {
    const target = bots.find(b => b.id === id);
    const updated = bots.filter(b => b.id !== id);
    saveBots(updated);
    if (target) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [SYSTEM] Terminated bot: ${target.name}.`]);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col relative font-mono overflow-y-auto">
      {/* Laser grids */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#FFBF00]/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Navigation header */}
      <div className="px-8 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl z-50">
        <Navbar />
      </div>

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 z-10">
        
        {/* COLUMN 1: INTERACTIVE RULE BUILDER */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="glass-panel border-[#FFBF00]/20 bg-[#030307]/80 p-5 rounded-none flex flex-col gap-4 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-[#FFBF00]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFBF00]">ALGO RULE COMPOSER</h3>
            </div>

            <form onSubmit={handleCreateBot} className="flex flex-col gap-4 text-[10px]">
              {/* Bot Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-500 uppercase tracking-widest font-black">BOT IDENTIFICATION</label>
                <input
                  type="text"
                  placeholder="e.g. Nifty Swing Sniper"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="bg-black/50 border border-white/10 text-[10px] p-2.5 focus:outline-none focus:border-[#FFBF00] text-white"
                />
              </div>

              {/* Asset choice */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-500 uppercase tracking-widest font-black">SELECT ASSET TARGET</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-black/50 border border-white/10 text-[10px] p-2.5 text-white focus:outline-none"
                >
                  <option value="Nifty 50">Nifty 50 Index</option>
                  <option value="RELIANCE.NS">Reliance Industries (NSE)</option>
                  <option value="BTC-USD">Bitcoin (Crypto)</option>
                  <option value="ETH-USD">Ethereum (Crypto)</option>
                </select>
              </div>

              {/* Condition Composer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 uppercase tracking-widest font-black">CONDITION TYPE</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="bg-black/50 border border-white/10 text-[10px] p-2.5 text-white focus:outline-none"
                  >
                    <option value="GAINS">PRICE GAINS (%)</option>
                    <option value="DROPS">PRICE DROPS (%)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 uppercase tracking-widest font-black">PERCENT VALUE</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="bg-black/50 border border-white/10 text-[10px] p-2.5 text-white focus:outline-none focus:border-[#FFBF00]"
                  />
                </div>
              </div>

              {/* Execution Actions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 uppercase tracking-widest font-black">EXECUTION ACTION</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="bg-black/50 border border-white/10 text-[10px] p-2.5 text-white focus:outline-none"
                  >
                    <option value="BUY">BUY / LONG</option>
                    <option value="SELL">SELL / SHORT</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 uppercase tracking-widest font-black">LOTS ALLOCATION</label>
                  <input
                    type="number"
                    min="1"
                    value={lots}
                    onChange={(e) => setLots(e.target.value)}
                    className="bg-black/50 border border-white/10 text-[10px] p-2.5 text-white focus:outline-none focus:border-[#FFBF00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full py-3 bg-[#FFBF00] hover:brightness-110 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,191,0,0.2)] rounded-none"
              >
                DEPLOY ALGOTRONIC BOT
              </button>
            </form>
          </div>
        </div>

        {/* COLUMN 2: ACTIVE RUNNING BOTS LEDGER */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="glass-panel border-white/10 bg-[#030307]/50 p-5 rounded-none flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-gray-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">DEPLOYED BOT LEDGER</h3>
              </div>
              <span className="text-[9px] text-gray-600 font-bold">{bots.length} BOTS</span>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px]">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="border border-white/5 p-4 bg-black/40 flex flex-col gap-2 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[11px] font-bold text-white group-hover:text-[#FFBF00] transition-colors">{bot.name}</h4>
                      <p className="text-[8.5px] text-gray-500 uppercase mt-0.5">{bot.asset} · {bot.lots} Lot(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBotStatus(bot.id)}
                        className={`p-1 border rounded-sm transition-all ${bot.status === 'ACTIVE' ? 'border-[#00e676]/30 bg-[#00e676]/10 text-[#00e676]' : 'border-white/10 bg-white/5 text-gray-400'}`}
                      >
                        {bot.status === 'ACTIVE' ? <Play size={10} className="fill-[#00e676]" /> : <Pause size={10} />}
                      </button>
                      <button
                        onClick={() => handleDeleteBot(bot.id)}
                        className="p-1 border border-white/10 bg-white/5 hover:border-red-500 hover:text-red-500 transition-all rounded-sm"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2 mt-1 flex justify-between items-center text-[8.5px]">
                    <span className="text-gray-500 uppercase">RULE TRIGGER</span>
                    <span className={bot.action === "BUY" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      IF {bot.condition} {bot.threshold}% → {bot.action}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[8px] text-gray-600 font-mono mt-1">
                    <span>STATUS: <span className={bot.status === "ACTIVE" ? "text-emerald-500" : "text-gray-500"}>{bot.status}</span></span>
                    <span>TRIGGERS: <span className="text-white">{bot.triggeredCount}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 3: LIVE MATRIX TERMINAL LOGS */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="glass-panel border-white/10 bg-black p-5 rounded-none h-[495px] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Terminal size={14} className="text-[#00FF41] animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00FF41]">ALGO MATRIX LOGS</h3>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-[#00FF41] leading-relaxed flex flex-col gap-2.5 custom-scrollbar">
              {logs.map((log, idx) => (
                <p key={idx} className="break-all last:font-bold">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
