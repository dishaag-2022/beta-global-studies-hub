import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, LogOut, Video as VideoIcon, Phone, Heart, Send, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatHeader({
  targetNode, isPeerActive, lastActiveTime, isDarkMode, setIsDarkMode,
  isLoveMode, setIsLoveMode, 
  startCall, callState, handlePingPartner, isPinging, handleLogout,
  setAppState, setExpandedImage, partnerImage 
}) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showPingToast, setShowPingToast] = useState(false);

  useEffect(() => {
    if (isPeerActive) return; 
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000); 
    return () => clearInterval(timer);
  }, [isPeerActive]);

  const formatLastActive = (timestamp) => {
    if (!timestamp) return "Offline"; 
    const diff = Math.floor((currentTime - timestamp) / 1000);
    if (diff < 60) return "Active just now";
    if (diff < 3600) return `Last active ${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `Last active ${Math.floor(diff/3600)}h ago`;
    return "Offline";
  };

  const onPingClick = () => {
    if (isPinging) return;
    handlePingPartner();
    setShowPingToast(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setShowPingToast(false), 3500);
  };

  return (
    <div className={`px-2 sm:px-4 py-3 flex justify-between items-center z-50 shadow-sm shrink-0 transition-colors duration-500 border-b relative ${isLoveMode ? "bg-[#1a050f]/90 backdrop-blur-md border-rose-900/40" : (isDarkMode ? "bg-[#18181b]/95 backdrop-blur-md border-[#27272a]" : "bg-white/95 backdrop-blur-md border-slate-100")}`}>
      
      <AnimatePresence>
        {showPingToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute top-full right-4 mt-2 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border backdrop-blur-xl
              ${isLoveMode ? "bg-[#2e0510]/95 border-rose-500/50 text-rose-100 shadow-[0_10px_40px_rgba(244,63,94,0.3)]" : 
                (isDarkMode ? "bg-[#27272a]/95 border-indigo-500/50 text-indigo-100 shadow-indigo-500/20" : "bg-white/95 border-indigo-200 text-indigo-600 shadow-indigo-500/10")}
            `}
          >
            {isLoveMode ? <Heart size={20} className="animate-bounce text-rose-400" fill="currentColor" /> : <Send size={20} className="animate-bounce text-indigo-500" />}
            <span className="text-[13px] sm:text-sm font-bold tracking-wide">
              {isLoveMode ? "Pinged! Your love will be coming soon... 💖" : "Ping Sent! Partner Notified 🔔"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button onClick={() => setAppState("WHATSAPP_UI")} className={`p-1 sm:p-2 rounded-full transition-colors active:scale-90 ${isLoveMode ? "text-rose-400 hover:bg-rose-900/30" : isDarkMode ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}>
            <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <div 
            onClick={() => setExpandedImage({ url: partnerImage || (isLoveMode ? "/love.png" : "/cat.png"), type: 'image' })}
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center relative shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 ${isLoveMode ? "bg-[#3f0f1f] border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]" : (isDarkMode ? "bg-[#27272a] border-[#09090b]" : "bg-slate-100 border-white")}`}
        >
          <img 
            src={partnerImage || (isLoveMode ? "/love.png" : "/cat.png")} 
            alt="Profile" 
            className="w-full h-full object-cover transition-opacity duration-500 bg-slate-200 dark:bg-slate-800" 
          />
          {isPeerActive && <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 rounded-full ${isLoveMode ? "border-[#1a050f]" : isDarkMode ? "border-[#18181b]" : "border-white"}`}></span>}
        </div>
        
        <div className="flex flex-col relative ml-1">
            <span className={`font-bold text-[14px] sm:text-base leading-tight transition-all duration-500 absolute top-0 ${isLoveMode ? "opacity-0 translate-y-[-10px]" : "opacity-100 translate-y-0 text-slate-100"}`}>{targetNode || "Partner"}</span>
            <span className={`font-bold text-[14px] sm:text-base leading-tight transition-all duration-500 ${isLoveMode ? "opacity-100 translate-y-0 text-rose-100" : "opacity-0 translate-y-[10px]"}`}>Love</span>

          {isPeerActive ? (
             <span className="text-[10px] sm:text-[11px] text-green-500 font-bold flex items-center gap-1 drop-shadow-sm tracking-wide">Online</span>
          ) : (
             <span className={`text-[9px] sm:text-[11px] font-semibold transition-colors duration-500 ${isLoveMode ? "text-rose-300/80" : isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
               {formatLastActive(lastActiveTime)}
             </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1.5">
        {/* 🔥 VIDEO CALL BUTTON - FIXED MOBILE VISIBILITY */}
        <button type="button" onClick={() => startCall(true)} disabled={callState !== "IDLE"} className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${callState !== "IDLE" ? "opacity-30" : isLoveMode ? "bg-rose-900/30 text-rose-300 hover:bg-rose-500/30" : isDarkMode ? "bg-[#27272a] text-blue-400 hover:bg-[#3f3f46]" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}>
          <VideoIcon size={18} strokeWidth={2.5} />
        </button>
        
        {/* 🔥 AUDIO CALL BUTTON */}
        <button type="button" onClick={() => startCall(false)} disabled={callState !== "IDLE"} className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${callState !== "IDLE" ? "opacity-30" : isLoveMode ? "bg-rose-900/30 text-rose-300 hover:bg-rose-500/30" : isDarkMode ? "bg-[#27272a] text-emerald-400 hover:bg-[#3f3f46]" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"}`}>
          <Phone size={18} strokeWidth={2.5} />
        </button>

        <button type="button" onClick={() => setIsLoveMode(!isLoveMode)} className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isLoveMode ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]" : isDarkMode ? "bg-[#27272a] text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 text-rose-500 hover:bg-rose-100"}`}>
          <Heart size={18} strokeWidth={2.5} fill={isLoveMode ? "currentColor" : "none"} className={isLoveMode ? "animate-pulse" : ""} />
        </button>

        {!isLoveMode && (
          <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={`hidden sm:block p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isDarkMode ? "bg-[#27272a] text-amber-400 hover:bg-[#3f3f46]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {isDarkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
          </button>
        )}
        
        <button type="button" onClick={onPingClick} disabled={isPinging} className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isPinging ? (isLoveMode ? "bg-rose-900/30 text-rose-400 opacity-50" : isDarkMode ? "bg-[#27272a] text-slate-500 opacity-50" : "bg-slate-100 text-slate-400 opacity-50") : (isLoveMode ? "bg-rose-900/30 text-rose-300 hover:bg-rose-500/30" : isDarkMode ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100")}`}>
          <Bell size={18} strokeWidth={2.5} className={isPinging ? "" : "animate-bounce"} />
        </button>
        
        <button type="button" onClick={handleLogout} className={`p-1.5 sm:p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isLoveMode ? "bg-red-900/40 text-red-400 hover:bg-red-500/30" : isDarkMode ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 text-rose-500 hover:bg-rose-100"}`}>
          <LogOut size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}