import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, LogOut, Video as VideoIcon, Phone, Heart } from "lucide-react";

export default function ChatHeader({
  targetNode, isPeerActive, lastActiveTime, isDarkMode, setIsDarkMode,
  isLoveMode, setIsLoveMode, 
  startCall, callState, handlePingPartner, isPinging, handleLogout
}) {
  const [currentTime, setCurrentTime] = useState(Date.now());

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

  return (
    <div className={`px-4 py-3 flex justify-between items-center z-20 shadow-sm shrink-0 transition-colors duration-500 border-b ${isLoveMode ? "bg-[#1a050f]/80 backdrop-blur-md border-rose-900/40" : (isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-white border-slate-100")}`}>
      
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center relative shadow-sm overflow-hidden transition-all duration-500 ${isLoveMode ? "bg-[#3f0f1f] border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]" : (isDarkMode ? "bg-[#27272a] border-[#09090b]" : "bg-slate-100 border-white")}`}>
          
          {/* 🔥 LOCAL PROFILE PICTURES */}
          {/* Make sure cat.jpg and love.jpg are directly inside your 'public' folder */}
          <img 
            src={isLoveMode ? "/love.png" : "/cat.png"} 
            alt="Profile" 
            className="w-full h-full object-cover transition-opacity duration-500 bg-slate-200 dark:bg-slate-800" 
          />
          
          {isPeerActive && <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full ${isLoveMode ? "border-[#1a050f]" : isDarkMode ? "border-[#18181b]" : "border-white"}`}></span>}
        </div>
        
        <div className="flex flex-col relative">
            <span className={`font-bold text-base leading-tight transition-all duration-500 absolute top-0 ${isLoveMode ? "opacity-0 translate-y-[-10px]" : "opacity-100 translate-y-0 text-slate-100"}`}>{targetNode || "Partner"}</span>
            <span className={`font-bold text-base leading-tight transition-all duration-500 ${isLoveMode ? "opacity-100 translate-y-0 text-rose-100" : "opacity-0 translate-y-[10px]"}`}>Love</span>

          {isPeerActive ? (
             <span className="text-xs text-green-500 font-medium flex items-center gap-1">Online now</span>
          ) : (
             <span className={`text-xs transition-colors duration-500 ${isLoveMode ? "text-rose-400/80" : isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
               {formatLastActive(lastActiveTime)}
             </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => startCall(true)} disabled={callState !== "IDLE"} className={`p-2 rounded-full transition-colors ${callState !== "IDLE" ? "opacity-30" : isLoveMode ? "bg-rose-900/30 text-rose-300 hover:bg-rose-500/20" : isDarkMode ? "bg-[#27272a] text-blue-400 hover:bg-[#3f3f46]" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}>
          <VideoIcon size={18} />
        </button>
        <button type="button" onClick={() => startCall(false)} disabled={callState !== "IDLE"} className={`p-2 rounded-full transition-colors ${callState !== "IDLE" ? "opacity-30" : isLoveMode ? "bg-rose-900/30 text-rose-300 hover:bg-rose-500/20" : isDarkMode ? "bg-[#27272a] text-green-400 hover:bg-[#3f3f46]" : "bg-green-50 text-green-500 hover:bg-green-100"}`}>
          <Phone size={18} />
        </button>

        {/* INTIMACY TOGGLE */}
        <button type="button" onClick={() => setIsLoveMode(!isLoveMode)} className={`p-2 rounded-full transition-all duration-300 ${isLoveMode ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-110" : isDarkMode ? "bg-[#27272a] text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 text-rose-500 hover:bg-rose-100"}`}>
          <Heart size={18} fill={isLoveMode ? "currentColor" : "none"} className={isLoveMode ? "animate-pulse" : ""} />
        </button>

        {/* HIDE DARK MODE TOGGLE WHEN IN LOVE MODE */}
        {!isLoveMode && (
          <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isLoveMode ? "bg-rose-900/30 text-rose-300" : isDarkMode ? "bg-[#27272a] text-amber-400 hover:bg-[#3f3f46]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
        
        <button type="button" onClick={handlePingPartner} disabled={isPinging} className={`p-2 rounded-full transition-colors ${isPinging ? (isLoveMode ? "bg-rose-900/30 text-rose-400" : isDarkMode ? "bg-[#27272a] text-slate-500" : "bg-slate-100 text-slate-400") : (isLoveMode ? "bg-rose-900/30 text-rose-300" : isDarkMode ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100")}`}>
          <Bell size={18} className={isPinging ? "" : "animate-bounce"} />
        </button>
        <button type="button" onClick={handleLogout} className={`p-2 rounded-full transition-colors ${isLoveMode ? "bg-red-900/40 text-red-400" : isDarkMode ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 text-rose-500 hover:bg-rose-100"}`}>
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}