"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, User, Send, ChevronRight, Award, AlertTriangle, CheckCircle, 
  HelpCircle, Shield, Sparkles, MessageSquare, ArrowLeft, RefreshCw 
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { playMechanicalClick, playCoinSound } from "@/utils/sound";

const MOCK_TRADES = [
  {
    id: "mock-1",
    asset: "BTC-USD",
    type: "BUY",
    status: "CLOSED",
    leverage: 75,
    pnl: -450.00,
    price: 63500,
    closePrice: 62900,
    timestamp: new Date(Date.now() - 3600000).toLocaleString(),
    grade: "F (LIQUIDATION COLLAPSE)",
    analysis: "Critical risk protocol violation. You placed a high-leverage 75x BUY position without an active Stop Loss. A minor 0.9% downward market fluctuation triggered immediate margin exhaustion and a liquidation event.",
    recommendation: "Reduce leverage to under 15x. Always set a strict Stop Loss at the local support floor to prevent catastrophic balance drawdowns.",
    mistakes: ["Leverage > 50x (EXTREME RISK)", "No Stop Loss set", "Entry at local resistance ceiling"]
  },
  {
    id: "mock-2",
    asset: "ETH-USD",
    type: "SELL",
    status: "CLOSED",
    leverage: 10,
    pnl: 280.00,
    price: 3450,
    closePrice: 3310,
    timestamp: new Date(Date.now() - 7200000).toLocaleString(),
    grade: "A+ (EXCELLENT WIN)",
    analysis: "Excellent systematic execution. You identified a local double-top reversal pattern and shorted with highly disciplined 10x leverage. You set a realistic Take Profit and exited cleanly with a 4% market drawdown.",
    recommendation: "Flawless risk profile. Keep maintaining systematic 5-15x leverage ratios to let your technical edge compound securely.",
    mistakes: []
  },
  {
    id: "mock-3",
    asset: "SOL-USD",
    type: "BUY",
    status: "OPEN",
    leverage: 50,
    pnl: -120.00,
    price: 142.50,
    closePrice: 141.30,
    timestamp: new Date(Date.now() - 1800000).toLocaleString(),
    grade: "B- (MARGIN EXPOSED)",
    analysis: "Active operations alert. You are currently holding an open 50x BUY position. High leverage has exposed your margin to sudden spikes. You are currently running a -$120.00 floating deficit.",
    recommendation: "Monitor liquidation limits closely. Consider taking a minor loss or adding margin to cushion the liquidation floor.",
    mistakes: ["High Leverage (50x)", "No hedging active"]
  }
];

export default function AuditRoomPage() {
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [messages, setMessages] = useState([
    { 
      id: "m-1", 
      sender: "BOT", 
      text: "Greetings, sovereign speculator. I am the Sovereign AI Auditor. Select any trade from your ledger on the right to perform a deep diagnostics check, or ask me any questions about risk control, psychology, or market structures on the left." 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Scroll chatbot to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Load local trades
    const localTrades = localStorage.getItem("apex_local_trades");
    let loadedTrades = [];
    if (localTrades) {
      try {
        const parsed = JSON.parse(localTrades);
        loadedTrades = parsed.map(t => {
          // Map to audit format dynamically
          const isProfit = t.pnl >= 0;
          const leverage = t.leverage || 1;
          const asset = t.asset || "BTC-USD";
          
          let grade = "C- (STRATEGY DEFICIT)";
          let mistakes = [];
          
          if (t.status === "OPEN") {
            grade = leverage > 50 ? "B- (MARGIN EXPOSED)" : "A (SECURE OPEN)";
            if (leverage > 40) mistakes.push("High Leverage Open");
          } else if (isProfit) {
            grade = leverage > 50 ? "B+ (LEVERAGED PROFIT)" : "A+ (EXCELLENT WIN)";
          } else {
            grade = leverage > 40 ? "F (LIQUIDATION COLLAPSE)" : "C- (STRATEGY DEFICIT)";
            if (leverage > 25) mistakes.push("Leverage > 25x");
            if (!t.slPrice) mistakes.push("No Stop Loss");
          }

          return {
            id: t.id || Math.random().toString(),
            asset,
            type: t.type || "BUY",
            status: t.status || "CLOSED",
            leverage,
            pnl: t.pnl || 0,
            price: t.price || 0,
            closePrice: t.closePrice || 0,
            timestamp: t.timestamp || new Date().toLocaleString(),
            grade,
            analysis: t.status === "OPEN" 
              ? `AI Sentinel is currently auditing your active ${t.type} position on ${asset} with ${leverage}x leverage.` 
              : isProfit 
                ? `Fantastic execution! You secured $${Math.abs(t.pnl).toFixed(2)} on this ${t.type} position. Exit timing was highly disciplined.` 
                : `AI Sentinel flagged critical risk factors. Your ${t.type} position on ${asset} resulted in a loss of -$${Math.abs(t.pnl).toFixed(2)}. ${leverage > 40 ? "Extreme leverage left zero margin for price fluctuations." : "Position sizing was too large for local support zones."}`,
            recommendation: t.status === "OPEN"
              ? leverage > 25 ? "⚠️ Reduce leverage to secure gains." : "✨ Strategy verified. Risk is within boundaries."
              : isProfit 
                ? "✨ Keep maintaining disciplined systematic leverage." 
                : leverage > 20 ? "🚨 Reduce leverage immediately to avoid margin traps." : "💡 Always consult the Candlestick Cheat Sheet before entry.",
            mistakes
          };
        });
      } catch (e) {}
    }

    // Combine mock trades with active trades to ensure a rich demo experience
    const combined = [...loadedTrades, ...MOCK_TRADES];
    setTrades(combined);
    setSelectedTrade(combined[0]);
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    playMechanicalClick();

    const newMsg = {
      id: `m-usr-${Date.now()}`,
      sender: "USER",
      text: inputMessage
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage("");

    // Simulate AI Audit Response
    setTimeout(() => {
      let botReply = "";
      const lower = inputMessage.toLowerCase();
      
      if (lower.includes("risk") || lower.includes("leverage") || lower.includes("liquidation")) {
        botReply = "Sovereign Risk Audit Protocol: High leverage compresses your liquidation envelope exponentially. At 50x leverage, a mere 2% move against your entry triggers full margin liquidation. I recommend keeping leverage below 15x and always aligning your Stop Loss with local support blocks.";
      } else if (lower.includes("cheat") || lower.includes("pattern") || lower.includes("candle")) {
        botReply = "Technical Pattern Protocol: Reversal structures like Double-Tops, Head & Shoulders, and Bullish Hammer candles offer high-probability entry criteria. Ensure you wait for the active candlestick close to confirm the pattern before committing margin.";
      } else if (lower.includes("psychology") || lower.includes("fear") || lower.includes("greed") || lower.includes("wrong")) {
        botReply = "Behavioral Speculation Protocol: Emotions cause traders to over-leverage or hold onto losing trades hoping for a reversal. Accept the technical thesis. If your Stop Loss is hit, respect the market's feedback, close the terminal, and wait for fresh systemic setups.";
      } else {
        botReply = "Audit Protocol: Active ledger verified. Select any trade card on the right-side Diagnostics Terminal. I will immediately analyze your entry prices, leverage parameters, and provide actionable post-mortems.";
      }

      setMessages(prev => [...prev, {
        id: `m-bot-${Date.now()}`,
        sender: "BOT",
        text: botReply
      }]);
      playCoinSound();
    }, 800);
  };

  const handleChipClick = (text) => {
    setInputMessage(text);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-body px-6 py-8 flex flex-col md:px-12">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto mt-12 flex flex-col gap-8 h-[calc(100vh-140px)]">
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4">
          <div>
            <span className="text-[8px] font-mono tracking-[0.5em] text-[#f0c040] uppercase font-black">AI MENTORSHIP MATRIX</span>
            <h2 className="text-2xl font-header font-black uppercase tracking-[0.2em] mt-1">Sovereign AI Audit & Mentor Room</h2>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">AI Auditor Active</span>
          </div>
        </div>

        {/* Main Split Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT SIDE: FULL-HEIGHT CHATBOT (col-span-7) */}
          <div className="lg:col-span-7 glass-panel border-white/5 bg-[#050508]/80 flex flex-col h-full rounded-sm overflow-hidden shadow-3xl">
            {/* Chatbot Header */}
            <div className="p-4 border-b border-white/5 bg-[#0a0a0f] flex items-center gap-3">
              <div className="p-2 bg-[#f0c040]/15 border border-[#f0c040]/30 rounded-full text-[#f0c040] shadow-[0_0_10px_rgba(240,192,64,0.1)]">
                <Bot size={16} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-[11px] font-header font-black uppercase tracking-widest text-white">Sovereign AI Risk Advisor</h4>
                <p className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest">Psychological & Quantitative Mentor</p>
              </div>
            </div>

            {/* Chat Log Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === "USER" ? "self-end flex-row-reverse" : "self-start"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[11px] flex-shrink-0 ${
                    msg.sender === "USER" 
                      ? "bg-white/5 border-white/10 text-white" 
                      : "bg-[#f0c040]/10 border-[#f0c040]/30 text-[#f0c040]"
                  }`}>
                    {msg.sender === "USER" ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  
                  <div className={`p-4 rounded-sm font-mono text-[10px] leading-relaxed border ${
                    msg.sender === "USER"
                      ? "bg-white/[0.02] border-white/10 text-white rounded-tr-none"
                      : "bg-[#f0c040]/5 border-[#f0c040]/10 text-gray-300 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Prompt Quick Chips */}
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-white/5 bg-[#030305]">
              {[
                { label: "Analyze my risk limits", text: "How do I avoid getting liquidated on high leverage?" },
                { label: "Check candlestick setup", text: "What candle patterns should I look for before trade entry?" },
                { label: "Overcome FOMO / Psychology", text: "My psychology is struggling. I keep taking revenge trades." }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.text)}
                  className="text-[8.5px] font-mono text-gray-400 hover:text-[#f0c040] hover:border-[#f0c040]/30 bg-white/[0.02] border border-white/5 hover:bg-[#f0c040]/5 px-2.5 py-1.5 transition-all rounded-sm uppercase tracking-wider"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a0f] flex gap-2">
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Audit entry thesis, risk levels, or trade psychology..."
                className="flex-1 bg-black/40 border border-white/5 rounded-sm px-4 py-2.5 font-mono text-[10.5px] text-white focus:outline-none focus:border-[#f0c040]/30 placeholder-gray-600"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#f0c040] hover:bg-[#f0c040]/90 text-black px-4 py-2.5 rounded-sm font-black font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(240,192,64,0.15)]"
              >
                <Send size={10} />
                Send
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: DIAGNOSTICS & TRADE FEEDBACK PANEL (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
            
            {/* Top: Active Diagnostics Terminal */}
            <div className="glass-panel p-6 border-white/5 bg-[#050508]/80 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 rounded-sm shadow-3xl">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <Sparkles size={14} className="text-[#f0c040]" />
                <h4 className="text-[10.5px] font-header font-black uppercase tracking-widest text-white">Diagnostics Terminal</h4>
              </div>

              {selectedTrade ? (
                <div className="flex flex-col gap-4">
                  {/* Score Grade Card */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-sm flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-[7px] font-mono text-gray-700 uppercase font-black tracking-widest">Grade Engine v1.0</div>
                    <div>
                      <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Performance Assessment</span>
                      <h4 className="text-[11px] font-header font-black uppercase text-[#f0c040] mt-0.5">{selectedTrade.grade}</h4>
                      <p className="text-[9px] text-gray-400 font-mono mt-1">{selectedTrade.asset} • {selectedTrade.type} ({selectedTrade.leverage}x)</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-[#f0c040]/30 bg-[#f0c040]/5 flex items-center justify-center font-header font-black text-[#f0c040] text-sm shadow-[0_0_10px_rgba(240,192,64,0.1)]">
                      {selectedTrade.grade.charAt(0)}
                    </div>
                  </div>

                  {/* AI Post-Mortem Report */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-sm flex flex-col gap-2">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">AI Audit Diagnostics Report</span>
                    <p className="text-[9.5px] text-gray-300 font-mono leading-relaxed">{selectedTrade.analysis}</p>
                  </div>

                  {/* Action Plan */}
                  <div className="bg-[#f0c040]/5 border border-[#f0c040]/10 p-4 rounded-sm flex flex-col gap-2">
                    <span className="text-[8px] font-mono text-[#f0c040] uppercase tracking-widest font-black">Remedial Action Guidelines</span>
                    <p className="text-[9.5px] text-gray-300 font-mono leading-relaxed">{selectedTrade.recommendation}</p>
                  </div>

                  {/* Red Violations Checklist */}
                  {selectedTrade.mistakes && selectedTrade.mistakes.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[8.5px] font-mono text-red-500 uppercase tracking-widest font-bold">Detected Trade Faults</span>
                      <div className="flex flex-col gap-1.5">
                        {selectedTrade.mistakes.map((mistake, i) => (
                          <div key={i} className="flex items-center gap-2 text-[9px] font-mono text-red-400 bg-red-500/5 border border-red-500/10 px-3 py-1.5 rounded-sm">
                            <AlertTriangle size={11} className="text-red-500 animate-bounce" />
                            {mistake}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 font-mono text-[10px]">
                  Select a trade ledger card below to load diagnostics.
                </div>
              )}
            </div>

            {/* Bottom: Trade Selector Cards List */}
            <div className="h-[220px] flex flex-col gap-3 overflow-y-auto custom-scrollbar">
              <span className="text-[8.5px] font-mono text-gray-600 uppercase tracking-widest font-black">Sovereign Trades Ledger</span>
              
              <div className="flex flex-col gap-2">
                {trades.map((trade) => {
                  const isSelected = selectedTrade?.id === trade.id;
                  const isProfit = trade.pnl >= 0;
                  return (
                    <button
                      key={trade.id}
                      onClick={() => {
                        playMechanicalClick();
                        setSelectedTrade(trade);
                      }}
                      className={`w-full text-left p-3 border transition-all rounded-sm flex justify-between items-center ${
                        isSelected 
                          ? "bg-[#f0c040]/10 border-[#f0c040]/30 shadow-[0_0_10px_rgba(240,192,64,0.05)]" 
                          : "bg-[#050508] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-header font-black text-[11px] uppercase text-white">{trade.asset}</span>
                          <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-sm ${
                            trade.type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {trade.type}
                          </span>
                          <span className="text-[8px] font-mono text-gray-500 font-bold">{trade.leverage}x</span>
                        </div>
                        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-1">{trade.timestamp}</p>
                      </div>

                      <div className="text-right">
                        <span className={`font-header font-black text-[11px] ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                          {isProfit ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                        </span>
                        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-0.5">
                          {trade.status === "OPEN" ? "ACTIVE OP" : "ARCHIVED"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
