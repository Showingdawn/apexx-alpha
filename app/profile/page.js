"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Award, Sliders, Settings, LogOut, Key, Database, Trash2, 
  Zap, TrendingUp, RefreshCw, Volume2, Shield, HelpCircle, Check, AlertTriangle
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { playMechanicalClick, playCoinSound } from "@/utils/sound";

const TITLES = [
  "Novice Speculator",
  "Sovereign Analyst",
  "Alpha Architect",
  "Risk Arbitrageur",
  "Hedge Master",
  "Quantum Market Maker"
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("PROFILE"); // "PROFILE" | "QUESTS" | "SETTINGS" | "UTILITIES"
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // RPG State
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [quests, setQuests] = useState([
    { id: 1, title: "Scalping Mastery", description: "Execute 3 successful scalp trades on the 1m chart.", xp: 250, completed: false, claimed: false },
    { id: 2, title: "Candle Sentry", description: "Spot a reversal pattern under Mentor Mode.", xp: 350, completed: true, claimed: false },
    { id: 3, title: "Capital Survival", description: "Navigate a Macro Shockwave without liquidation.", xp: 450, completed: false, claimed: false },
    { id: 4, title: "Liquidity Raid", description: "Execute a panic order with >$5k buying power.", xp: 500, completed: true, claimed: false },
    { id: 5, title: "Sharpe Optimizer", description: "Achieve a Profit Factor > 1.5 in Performance DNA.", xp: 600, completed: false, claimed: false },
    { id: 6, title: "Psychology Shield", description: "Complete an AI Mentorship Chat in the Audit Room.", xp: 400, completed: false, claimed: false }
  ]);
  
  // App Settings State
  const [soundFX, setSoundFX] = useState(true);
  const [brokerageMode, setBrokerageMode] = useState(false);
  const [droneVolume, setDroneVolume] = useState(50);
  
  // Action notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfirmPurge, setShowConfirmPurge] = useState(false);

  const handleClaimQuest = (questId) => {
    const updated = quests.map(q => q.id === questId ? { ...q, claimed: true } : q);
    const target = quests.find(q => q.id === questId);
    if (!target) return;

    let nextXp = xp + target.xp;
    let nextLvl = level;

    playCoinSound();

    if (nextXp >= 1000) {
      nextXp -= 1000;
      nextLvl = Math.min(6, nextLvl + 1);
      setSuccessMsg(`LEVEL UP! You achieved Level ${nextLvl}: ${TITLES[nextLvl - 1]}!`);
      setTimeout(() => setSuccessMsg(""), 6000);
    } else {
      setSuccessMsg(`Claimed +${target.xp} XP for "${target.title}"!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }

    setLevel(nextLvl);
    setXp(nextXp);
    setQuests(updated);

    localStorage.setItem("apex_rpg_level", nextLvl.toString());
    localStorage.setItem("apex_rpg_xp", nextXp.toString());
    localStorage.setItem("apex_rpg_quests", JSON.stringify(updated));

    window.dispatchEvent(new Event("storage"));
  };

  const handleSimulateQuest = (questId) => {
    playMechanicalClick();
    const updated = quests.map(q => q.id === questId ? { ...q, completed: true } : q);
    setQuests(updated);
    localStorage.setItem("apex_rpg_quests", JSON.stringify(updated));
    setSuccessMsg(`Quest "${quests.find(q => q.id === questId)?.title}" completed & claimable!`);
    setTimeout(() => setSuccessMsg(""), 4000);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Pull local settings & level
    const savedLevel = localStorage.getItem("apex_rpg_level");
    const savedXP = localStorage.getItem("apex_rpg_xp");
    const savedQuests = localStorage.getItem("apex_rpg_quests");
    if (savedLevel) setLevel(Number(savedLevel));
    if (savedXP) setXp(Number(savedXP));
    if (savedQuests) {
      try {
        setQuests(JSON.parse(savedQuests));
      } catch (e) {}
    }

    const sfx = localStorage.getItem("apex_settings_sound_fx");
    const brokerage = localStorage.getItem("apex_settings_brokerage_mode");
    const droneVol = localStorage.getItem("apex_settings_drone_vol");

    if (sfx !== null) setSoundFX(sfx === "true");
    if (brokerage !== null) setBrokerageMode(brokerage === "true");
    if (droneVol !== null) setDroneVolume(Number(droneVol));

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    playMechanicalClick();
    await signOut(auth);
    window.location.href = "/";
  };

  const handleSaveSetting = (key, value) => {
    playMechanicalClick();
    localStorage.setItem(key, value.toString());
    
    // Trigger window events to sync other components
    window.dispatchEvent(new Event("storage"));
  };

  const handleTopUp = () => {
    playCoinSound();
    localStorage.setItem("apex_local_balance", "10000.00");
    window.dispatchEvent(new Event("storage"));
    setSuccessMsg("Wallet successfully funded with $10,000.00 Cash!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handlePurgeLedger = () => {
    playMechanicalClick();
    localStorage.removeItem("apex_local_trades");
    window.dispatchEvent(new Event("storage"));
    setShowConfirmPurge(false);
    setSuccessMsg("Sovereign trade ledgers have been completely purged.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-body px-6 py-8 flex flex-col md:px-12">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto mt-12 flex flex-col gap-8">
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
          <div>
            <span className="text-[8px] font-mono tracking-[0.5em] text-[#f0c040] uppercase font-black">SYSTEM OPERATIONS</span>
            <h2 className="text-2xl font-header font-black uppercase tracking-[0.2em] mt-1">Sovereign Profile & Command Center</h2>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-sm flex-wrap gap-1">
            {[
              { id: "PROFILE", label: "User Identity", icon: User },
              { id: "QUESTS", label: "Quests & Tasks", icon: Award },
              { id: "SETTINGS", label: "App Settings", icon: Sliders },
              { id: "UTILITIES", label: "Database Tools", icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playMechanicalClick();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest px-4 py-2 transition-all ${
                    activeTab === tab.id 
                      ? "bg-[#f0c040]/10 border border-[#f0c040]/30 text-[#f0c040] shadow-[0_0_10px_rgba(240,192,64,0.1)]" 
                      : "text-gray-500 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert Banner */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex items-center gap-3 text-emerald-400 font-mono text-[10.5px]"
            >
              <Check size={14} className="animate-bounce" />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Display Left Sidebar */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="glass-panel p-6 border-white/5 bg-[#050508] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-gray-700 font-bold uppercase tracking-widest">
                VER V9.1
              </div>
              
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border border-[#f0c040]/30 flex items-center justify-center text-[#f0c040] bg-[#f0c040]/5 shadow-[0_0_15px_rgba(240,192,64,0.1)]">
                  <User size={28} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#f0c040] text-black font-mono font-black text-[8.5px] px-1.5 py-0.5 rounded-full border border-black shadow-[0_0_8px_rgba(240,192,64,0.4)]">
                  Lvl {level}
                </div>
              </div>
              
              <h3 className="text-white font-header font-black uppercase tracking-widest text-sm">
                {user ? user.displayName || "Sovereign Trader" : "GUEST ACCOUNT"}
              </h3>
              
              <div className="mt-2 bg-[#f0c040]/5 border border-[#f0c040]/20 px-3 py-1 text-[#f0c040] font-mono text-[8.5px] uppercase tracking-widest rounded-sm font-bold">
                Level {level} • {xp} / 1000 XP
              </div>

              <p className="text-[9px] text-gray-500 font-mono mt-2">
                {user ? user.email : "Register for cloud sync support"}
              </p>

              {/* Visual XP Progress Bar */}
              <div className="w-full mt-4 bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 p-[0.5px]">
                <div 
                  className="bg-[#f0c040] h-full rounded-full"
                  style={{ width: `${(xp / 1000) * 100}%` }}
                />
              </div>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="mt-6 w-full flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 py-2.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all rounded-sm"
                >
                  <LogOut size={12} />
                  Terminate Session
                </button>
              ) : (
                <div className="mt-6 w-full flex flex-col gap-2">
                  <Link href="/login" className="w-full text-center border border-[#f0c040]/30 hover:border-[#f0c040] hover:bg-[#f0c040]/5 text-[#f0c040] py-2.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all rounded-sm">
                    Access Account
                  </Link>
                  <Link href="/signup" className="w-full text-center border border-white/10 hover:border-white hover:bg-white/5 text-white py-2.5 text-[9px] font-mono font-black uppercase tracking-widest transition-all rounded-sm">
                    Create Identity
                  </Link>
                </div>
              )}
            </div>

            {/* Academy level panel */}
            <div className="glass-panel p-6 border-white/5 bg-[#050508]">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
                <Award size={14} className="text-[#f0c040]" />
                <h4 className="text-[10px] font-header font-black uppercase tracking-widest text-white">Sovereign Academy Rank</h4>
              </div>

              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Current level reached</p>
              <h3 className="text-white font-header font-black text-sm uppercase tracking-wider mt-1 text-[#f0c040]">
                LEVEL {level}: {TITLES[level - 1] || "Apex Market Maker"}
              </h3>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 uppercase mb-1.5">
                  <span>Progress to level-up</span>
                  <span>{xp} / 1000 XP</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10 p-[0.5px]">
                  <div 
                    className="bg-[#f0c040] h-full rounded-full"
                    style={{ width: `${(xp / 1000) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Area Tab Forms */}
          <div className="md:col-span-2">
            
            {/* User Identity / Profile Tab */}
            {activeTab === "PROFILE" && (
              <div className="glass-panel p-8 border-white/5 bg-[#050508] h-full flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-header font-black uppercase tracking-[0.2em] text-xs">User Identity & Performance Summary</h3>
                  <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Sovereign Performance Audit logs</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 border border-white/5 p-4 rounded-sm">
                    <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Active Ledger Status</span>
                    <p className="text-white font-header font-black text-xs uppercase mt-1 text-emerald-400">OPERATIONAL</p>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-4 rounded-sm">
                    <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Database Sync Integrity</span>
                    <p className="text-white font-header font-black text-xs uppercase mt-1 text-emerald-400">LOCAL MEMORY</p>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/5 p-5 rounded-sm flex flex-col gap-4">
                  <h4 className="text-[9px] font-mono font-black uppercase tracking-widest text-[#f0c040] border-b border-white/5 pb-2">Academic Quests Accomplished</h4>
                  <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                    You have unlocked standard tutorials inside the Apex Academy. Complete additional quest vectors on the Trade desk to build XP and level up your overall ranking titles.
                  </p>
                </div>

                <div className="border border-white/5 p-6 rounded-sm bg-gradient-to-r from-black/60 to-[#f0c040]/5 flex flex-col gap-4">
                  <div>
                    <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#f0c040]">Sovereign Rank Perks & Rewards</h4>
                    <p className="text-[8.5px] text-gray-600 font-mono uppercase tracking-widest mt-0.5">As you level up, you unlock active trading benefits</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    {[
                      { lvl: 1, title: "Novice Speculator", benefit: "0.05% Leverage Fees", active: level >= 1 },
                      { lvl: 2, title: "Sovereign Analyst", benefit: "0.04% Fees • Algotronic signals", active: perk => level >= 2 },
                      { lvl: 3, title: "Alpha Architect", benefit: "0.03% Fees • Premium Post-Mortems", active: level >= 3 },
                      { lvl: 4, title: "Risk Arbitrageur", benefit: "0.02% Fees • Multi-lot sizing", active: level >= 4 },
                      { lvl: 5, title: "Hedge Master", benefit: "0.01% Fees • Hedging Margin Boost", active: level >= 5 },
                      { lvl: 6, title: "Quantum Market Maker", benefit: "0% Fees • 0.01% Limit rebates", active: level >= 6 },
                    ].map(perk => {
                      const isActive = typeof perk.active === 'function' ? perk.active() : perk.active;
                      return (
                        <div 
                          key={perk.lvl} 
                          className={`p-3 border rounded-sm flex flex-col gap-1 transition-all ${
                            isActive 
                              ? 'border-[#f0c040]/30 bg-[#f0c040]/5' 
                              : 'border-white/5 bg-black/40 opacity-40'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono font-black text-gray-500 uppercase">LVL {perk.lvl}</span>
                            {isActive && (
                              <span className="text-[7.5px] font-mono font-black bg-[#00e676]/10 text-[#00e676] px-1 py-0.5 rounded-sm uppercase">ACTIVE</span>
                            )}
                          </div>
                          <h5 className="text-[9.5px] font-header font-black text-white uppercase tracking-wider">{perk.title}</h5>
                          <p className="text-[9px] text-[#f0c040] font-mono leading-none">{perk.benefit}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quests & Tasks Tab */}
            {activeTab === "QUESTS" && (
              <div className="glass-panel p-8 border-white/5 bg-[#050508] h-full flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-white font-header font-black uppercase tracking-[0.2em] text-xs">Sovereign Quests & Milestones</h3>
                    <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Complete trading tasks to earn XP and rank up</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-[#f0c040]">
                      {quests.filter(q => q.claimed).length} / {quests.length} CLAIMED
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {quests.map(quest => (
                    <div 
                      key={quest.id} 
                      className={`border p-4 transition-all rounded-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        quest.claimed 
                          ? 'border-white/5 bg-white/[0.01] opacity-55' 
                          : quest.completed 
                            ? 'border-[#f0c040]/30 bg-[#f0c040]/5 shadow-[0_0_15px_rgba(240,192,64,0.05)]' 
                            : 'border-white/5 bg-black/20 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[7px] font-mono font-black px-1.5 py-0.5 rounded-sm uppercase ${
                            quest.claimed 
                              ? 'bg-white/5 text-gray-500' 
                              : quest.completed 
                                ? 'bg-[#f0c040]/20 text-[#f0c040]' 
                                : 'bg-white/5 text-gray-400'
                          }`}>
                            {quest.claimed ? "CLAIMED" : quest.completed ? "READY TO CLAIM" : "IN PROGRESS"}
                          </span>
                          <span className="text-[9px] font-mono text-[#00e676] font-bold">+{quest.xp} XP</span>
                        </div>
                        <h4 className="text-[11px] font-header font-black uppercase text-white tracking-wider">{quest.title}</h4>
                        <p className="text-[9.5px] text-gray-500 font-mono mt-1 leading-relaxed">{quest.description}</p>
                      </div>

                      <div className="flex-shrink-0 self-end sm:self-center">
                        {!quest.claimed && (
                          quest.completed ? (
                            <button
                              onClick={() => handleClaimQuest(quest.id)}
                              className="px-4 py-2 bg-[#f0c040] hover:bg-[#f0c040]/90 transition text-black font-black font-mono text-[8.5px] uppercase tracking-widest rounded-sm shadow-[0_0_15px_rgba(240,192,64,0.25)]"
                            >
                              CLAIM XP
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSimulateQuest(quest.id)}
                              className="px-3 py-1.5 border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-white font-black font-mono text-[8px] uppercase tracking-widest rounded-sm"
                            >
                              SIMULATE
                            </button>
                          )
                        )}
                        {quest.claimed && (
                          <span className="text-[9px] font-mono text-[#00e676] flex items-center gap-1 uppercase">
                            <Check size={12} />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* App Settings Tab */}
            {activeTab === "SETTINGS" && (
              <div className="glass-panel p-8 border-white/5 bg-[#050508] h-full flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-header font-black uppercase tracking-[0.2em] text-xs">Application Settings Panel</h3>
                  <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Manage sound, execution types, and haptics</p>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Toggle 1: Tactile SFX */}
                  <div className="flex justify-between items-center bg-black/20 p-4 border border-white/5 rounded-sm">
                    <div>
                      <h4 className="text-[10.5px] font-header font-black uppercase tracking-widest text-white">Tactile Feedback Sounds</h4>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">Play brown mechanical key clicks on user actions</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !soundFX;
                        setSoundFX(next);
                        handleSaveSetting("apex_settings_sound_fx", next);
                      }}
                      className={`text-[8.5px] font-mono font-black uppercase px-3 py-1.5 border rounded-sm ${
                        soundFX 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/40 text-red-400"
                      }`}
                    >
                      {soundFX ? "ENGAGED" : "MUTED"}
                    </button>
                  </div>

                  {/* Toggle 2: Zerodha Brokerage Fee */}
                  <div className="flex justify-between items-center bg-black/20 p-4 border border-white/5 rounded-sm">
                    <div>
                      <h4 className="text-[10.5px] font-header font-black uppercase tracking-widest text-white">Fidelity Brokerage Simulation</h4>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">Deduct standard mock transaction fees on placing orders</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !brokerageMode;
                        setBrokerageMode(next);
                        handleSaveSetting("apex_settings_brokerage_mode", next);
                      }}
                      className={`text-[8.5px] font-mono font-black uppercase px-3 py-1.5 border rounded-sm ${
                        brokerageMode 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/40 text-red-400"
                      }`}
                    >
                      {brokerageMode ? "ENGAGED" : "MUTED"}
                    </button>
                  </div>

                  {/* Volume Slider: Soundscape Drone */}
                  <div className="bg-black/20 p-4 border border-white/5 rounded-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-[10.5px] font-header font-black uppercase tracking-widest text-white">Focus Synth Volume</h4>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">Adjust the level of the binaural focus drone loop</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#f0c040] font-bold">{droneVolume}%</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      value={droneVolume}
                      onChange={(e) => {
                        const vol = Number(e.target.value);
                        setDroneVolume(vol);
                        localStorage.setItem("apex_settings_drone_vol", vol.toString());
                        window.dispatchEvent(new Event("storage"));
                      }}
                      className="w-full accent-[#f0c040] h-1 bg-white/5 rounded-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Database Utilities Tab */}
            {activeTab === "UTILITIES" && (
              <div className="glass-panel p-8 border-white/5 bg-[#050508] h-full flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-header font-black uppercase tracking-[0.2em] text-xs">Database Reset & Maintenance Tools</h3>
                  <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase tracking-widest">Top up cash, or purge paper-trade logs</p>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Action 1: Top Up Balance */}
                  <div className="flex justify-between items-center bg-black/20 p-4 border border-white/5 rounded-sm">
                    <div>
                      <h4 className="text-[10.5px] font-header font-black uppercase tracking-widest text-white">Reset Available Cash</h4>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">Top up your paper wallet balance back to $10,000.00</p>
                    </div>
                    <button
                      onClick={handleTopUp}
                      className="flex items-center gap-1.5 text-[8.5px] font-mono font-black uppercase px-4 py-2 border border-[#f0c040]/40 text-[#f0c040] bg-[#f0c040]/5 hover:bg-[#f0c040]/10 rounded-sm transition-all"
                    >
                      <RefreshCw size={10} className="animate-spin" style={{ animationDuration: "3s" }} />
                      TOP-UP
                    </button>
                  </div>

                  {/* Action 2: Purge Trades Ledger */}
                  <div className="flex flex-col gap-3 bg-black/20 p-4 border border-white/5 rounded-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-[10.5px] font-header font-black uppercase tracking-widest text-red-400">Purge Trades Ledger</h4>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">Irreversibly delete your entire paper-trading history</p>
                      </div>
                      
                      {!showConfirmPurge ? (
                        <button
                          onClick={() => {
                            playMechanicalClick();
                            setShowConfirmPurge(true);
                          }}
                          className="flex items-center gap-1.5 text-[8.5px] font-mono font-black uppercase px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/5 rounded-sm transition-all"
                        >
                          <Trash2 size={10} />
                          PURGE
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handlePurgeLedger}
                            className="text-[8px] font-mono font-black uppercase px-3 py-1.5 bg-red-600 border border-red-500 text-white rounded-sm"
                          >
                            CONFIRM
                          </button>
                          <button
                            onClick={() => {
                              playMechanicalClick();
                              setShowConfirmPurge(false);
                            }}
                            className="text-[8px] font-mono font-black uppercase px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white rounded-sm"
                          >
                            CANCEL
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {showConfirmPurge && (
                      <div className="text-[8.5px] font-mono text-amber-500 flex items-center gap-1.5 uppercase mt-1">
                        <AlertTriangle size={12} />
                        Warning: This operation is destructive and cannot be undone.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
