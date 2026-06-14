import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, ChevronLeft, Send, Loader2 } from 'lucide-react';
import CryptoJS from "crypto-js";

const SECRET_KEY = "tour-404-classified-key";

export default function CustomPing({ setAppState, studentId, targetNode, activeChannel, isDarkMode, isLoveMode }) {
  const [msg, setMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setIsSending(true);

    // Encrypt the custom ping message
    const pingText = CryptoJS.AES.encrypt(`SYS_CUSTOM_PING::${msg}`, SECRET_KEY).toString();
    
    try {
      // Send via Pusher WebSockets (For instant In-App Pop-up)
      await fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel })
      });

      // Also hit the standard ping API (in case your backend handles web-push for offline users)
      await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: studentId.trim(), receiver: targetNode, channel: activeChannel, customMessage: msg })
      }).catch(() => {}); // Ignore if backend doesn't support customMessage yet

      alert("✅ Custom Notification Sent to " + targetNode + "!");
      setMsg("");
      setAppState("MODE_SELECTION"); // Wapas dashboard pe le jao
    } catch(error) {
      alert("❌ Failed to send notification");
    }
    
    setIsSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={`absolute inset-0 w-full h-[100dvh] flex flex-col z-[100] ${isLoveMode ? "bg-[#050002]" : isDarkMode ? "bg-[#09090b]" : "bg-slate-50"}`}
    >
      {/* Top Header */}
      <div className={`p-6 flex items-center gap-4 border-b ${isLoveMode ? "border-rose-900/50 bg-[#2e1018]" : isDarkMode ? "border-[#27272a] bg-[#18181b]" : "border-slate-200 bg-white"}`}>
        <button onClick={() => setAppState("MODE_SELECTION")} className={`p-2 rounded-full transition-colors ${isLoveMode ? "text-rose-400 hover:bg-rose-900/50" : isDarkMode ? "text-slate-400 hover:bg-[#27272a]" : "text-slate-500 hover:bg-slate-100"}`}>
          <ChevronLeft size={24} />
        </button>
        <h2 className={`text-xl font-bold ${isLoveMode ? "text-rose-100" : isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
          Custom Alert to {targetNode}
        </h2>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${isLoveMode ? "bg-[#1a050f] border-rose-900/50 shadow-[0_0_20px_rgba(225,29,72,0.1)]" : isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-white border-slate-100"}`}>
          
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${isLoveMode ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"}`}>
            <BellRing size={32} className="animate-pulse" />
          </div>
          
          <h3 className={`text-center font-black text-2xl mb-2 ${isLoveMode ? "text-rose-100" : isDarkMode ? "text-slate-100" : "text-slate-800"}`}>Send Notification</h3>
          <p className={`text-center text-sm font-medium mb-8 ${isLoveMode ? "text-rose-300/70" : isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            This message will pop up directly on your partner's screen immediately.
          </p>

          <form onSubmit={handleSend} className="space-y-4">
            <textarea
              autoFocus
              rows="4"
              placeholder="Type your alert message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className={`w-full p-4 rounded-xl outline-none resize-none transition-all ${isLoveMode ? "bg-[#2e1018] text-rose-100 placeholder-rose-900 focus:border-rose-500 border border-rose-900/50" : isDarkMode ? "bg-[#09090b] text-slate-200 placeholder-slate-600 border border-[#3f3f46] focus:border-amber-500" : "bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-amber-500"}`}
            />
            
            <button
              type="submit"
              disabled={!msg.trim() || isSending}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                ${!msg.trim() || isSending
                  ? "opacity-50 cursor-not-allowed"
                  : isLoveMode ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:-translate-y-1" : "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/30 hover:-translate-y-1"
                }
              `}
            >
              {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {isSending ? "Sending..." : "Send Alert"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}