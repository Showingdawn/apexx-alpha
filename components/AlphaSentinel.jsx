import React from 'react';
import { Brain, Activity, ShieldAlert, Cpu, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlphaSentinel({ activeInsight }) {
  const getInsightData = () => {
    switch (activeInsight) {
      case 'BULLISH_HOVER':
        return {
          directive: "EXECUTION STRATEGY",
          title: "LONG POSITION EVALUATION",
          text: "You are evaluating a BUY/LONG market order. Institutional buyers are seeking to sweep the active offers. Placing your Stop Loss underneath the current support protection zone minimizes downside liability while targeting the Amber resistance levels.",
          confidence: "94.2%",
          risk: "STABLE",
          color: "#00e676"
        };
      case 'BEARISH_HOVER':
        return {
          directive: "EXECUTION STRATEGY",
          title: "SHORT POSITION EVALUATION",
          text: "You are evaluating a SELL/SHORT market order. Supply is starting to absorb buy-side liquidity. A bearish sweep implies you expect price to break the Cyan support lines. Ensure your Take Profit is set just above the floor rejection zone.",
          confidence: "91.8%",
          risk: "MODERATE",
          color: "#FF3131"
        };
      case 'LEVERAGE_ADJUST':
        return {
          directive: "RISK MITIGATION",
          title: "LEVERAGE AMPLIFICATION ALERT",
          text: "Increasing leverage amplifies both capital efficiency and liquidation proximity. Ensure your Session Risk Limit is strictly set to prevent high-frequency margin squeeze. Hedging is recommended.",
          confidence: "98.5%",
          risk: "HIGH LIQUIDITY RISK",
          color: "#FFBF00"
        };
      case 'APPROACHING_SUPPORT':
        return {
          directive: "MARKET ANOMALY DETECTION",
          title: "SUPPORT PROTECTION ZONE SENSE",
          text: "Price is actively approaching a major historical Support level. Whales typically stack buying limits inside this coordinate zone to build massive buy walls. Rejections are highly probable.",
          confidence: "96.4%",
          risk: "OPTIMAL BUY ENTRY",
          color: "#00FFFF"
        };
      case 'APPROACHING_RESISTANCE':
        return {
          directive: "MARKET ANOMALY DETECTION",
          title: "RESISTANCE REJECTION DETECTED",
          text: "Price is entering a high-density historical Resistance zone. Institutional sellers are unloading blocks here to absorb bullish momentum. Proceed with caution on breakouts without sustained volume.",
          confidence: "95.1%",
          risk: "PROBABLE REJECTION",
          color: "#FFBF00"
        };
      default:
        return {
          directive: "SYSTEM CONTEXT IDLE",
          title: "SENTINEL COGNITIVE SCANNER",
          text: "Standing by. Active neural sensors are scanning execution context, orderbook depth, and chart wicks. Hover over any asset, order button, or indicator to engage the AI tactical assistant.",
          confidence: "100%",
          risk: "SECURE",
          color: "#FFBF00"
        };
    }
  };

  const data = getInsightData();

  return (
    <div className="glass-panel border-[#FFBF00]/20 overflow-hidden shadow-2xl bg-[#030307]/90 backdrop-blur-xl relative flex flex-col p-5 gap-4">
      {/* Absolute tech vector grid line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
      
      {/* Header telemetry */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 border border-[#FFBF00]/30 bg-[#FFBF00]/5 text-[#FFBF00]">
            <Brain size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[7.5px] font-mono text-[#FFBF00] tracking-[0.25em] block uppercase font-bold">SENTINEL SYSTEM COGNITION</span>
            <h2 className="text-[11px] font-header font-black tracking-widest uppercase text-white mt-0.5">
              ALPHA AI GUIDE
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px] bg-white/5 px-2 py-1 border border-white/10 rounded-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00e676] animate-ping" />
          <span className="text-gray-400 font-bold uppercase tracking-wider">SYNCED</span>
        </div>
      </div>

      {/* Main content body (enlarged & highly professional) */}
      <div className="relative min-h-[120px] flex flex-col justify-center bg-black/40 border border-white/5 p-4 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFBF00]/2 to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeInsight}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2 z-10"
          >
            <div className="flex items-center gap-1.5 font-mono text-[8px] tracking-widest uppercase font-black" style={{ color: data.color }}>
              <Radio size={10} className="animate-pulse" />
              {data.directive}
            </div>
            <h3 className="text-[12px] font-header font-black tracking-wider text-white uppercase mt-0.5">
              {data.title}
            </h3>
            <p className="text-[11px] font-mono text-gray-400 leading-relaxed mt-1">
              {data.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Telemetry Stats Grid */}
      <div className="grid grid-cols-2 gap-3 font-mono text-[9px] border-t border-white/5 pt-3">
        <div>
          <p className="text-[7.5px] text-gray-500 uppercase tracking-widest">COGNITIVE CONFIDENCE</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white font-black">{data.confidence}</span>
            <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#00e676] h-full"
                initial={{ width: 0 }}
                animate={{ width: data.confidence }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[7.5px] text-gray-500 uppercase tracking-widest">RISK CLASSIFICATION</p>
          <p className="font-bold uppercase mt-1" style={{ color: data.color }}>
            {data.risk}
          </p>
        </div>
      </div>
    </div>
  );
}
