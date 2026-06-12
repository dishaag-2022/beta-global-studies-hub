import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, LogOut, Video as VideoIcon, Phone } from "lucide-react";

export default function ChatHeader({
  targetNode,
  isPeerActive,
  lastActiveTime,
  isDarkMode,
  setIsDarkMode,
  startCall,
  callState,
  handlePingPartner,
  isPinging,
  handleLogout
}) {
  
  // ---> NEW: Live timer to automatically tick the "m ago" counter <---
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Only run the timer if the peer is NOT active
    if (isPeerActive) return; 
    
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // Update the relative time every 10 seconds

    return () => clearInterval(timer);
  }, [isPeerActive]);

  // ---> NEW: Formatter that uses the live timer <---
  const formatLastActive = (timestamp) => {
    if (!timestamp) return "Offline"; // Shows "Offline" ONLY when app just booted and hasn't seen them yet
    
    const diff = Math.floor((currentTime - timestamp) / 1000);
    
    if (diff < 60) return "Active just now";
    if (diff < 3600) return `Last active ${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `Last active ${Math.floor(diff/3600)}h ago`;
    return "Offline";
  };

  return (
    <div className={`px-4 py-3 flex justify-between items-center z-20 shadow-sm shrink-0 transition-colors duration-300 border-b ${isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-white border-slate-100"}`}>
      
      {/* LEFT SIDE: Profile & Status */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center relative shadow-sm overflow-hidden ${isDarkMode ? "bg-[#27272a] border-[#09090b]" : "bg-slate-100 border-white"}`}>
          <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop" alt="Profile" className="w-full h-full object-cover" />
          {isPeerActive && <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full ${isDarkMode ? "border-[#18181b]" : "border-white"}`}></span>}
        </div>
        <div className="flex flex-col">
          <span className={`font-bold text-base leading-tight ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
            {targetNode || "Partner"}
          </span>
          {isPeerActive ? (
             <span className="text-xs text-green-500 font-medium flex items-center gap-1">Online now</span>
          ) : (
             <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
               {formatLastActive(lastActiveTime)}
             </span>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Action Buttons */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => startCall(true)} disabled={callState !== "IDLE"} className={`p-2 rounded-full transition-colors ${callState !== "IDLE" ? "opacity-30" : isDarkMode ? "bg-[#27272a] text-blue-400 hover:bg-[#3f3f46]" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}>
          <VideoIcon size={18} />
        </button>
        <button type="button" onClick={() => startCall(false)} disabled={callState !== "IDLE"} className={`p-2 rounded-full transition-colors ${callState !== "IDLE" ? "opacity-30" : isDarkMode ? "bg-[#27272a] text-green-400 hover:bg-[#3f3f46]" : "bg-green-50 text-green-500 hover:bg-green-100"}`}>
          <Phone size={18} />
        </button>
        <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? "bg-[#27272a] text-amber-400 hover:bg-[#3f3f46]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" onClick={handlePingPartner} disabled={isPinging} className={`p-2 rounded-full transition-colors ${isPinging ? (isDarkMode ? "bg-[#27272a] text-slate-500" : "bg-slate-100 text-slate-400") : (isDarkMode ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100")}`}>
          <Bell size={18} className={isPinging ? "" : "animate-bounce"} />
        </button>
        <button type="button" onClick={handleLogout} className={`p-2 rounded-full transition-colors ${isDarkMode ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-rose-50 text-rose-500 hover:bg-rose-100"}`}>
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}