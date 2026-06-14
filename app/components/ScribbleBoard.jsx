import React, { useState, useEffect, useRef } from "react";
import { X, Palette, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { motion } from "framer-motion";

export default function ScribbleBoard({
  setAppState, studentId, targetNode, isPeerActive, callState, startCall, toggleMic, localStream, isMicMuted,
  sendDrawEvent, sendClearEvent, answerCall, endCall 
}) {
  const [scribbleColor, setScribbleColor] = useState("#000000");
  const canvasRef = useRef(null);
  
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastSentPosRef = useRef({ x: 0, y: 0 });
  const lastSendTimeRef = useRef(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      clearCanvasLocal();
    }
  }, []);

  useEffect(() => {
    const handlePeerDraw = (e) => {
      const { x0, y0, x1, y1, color } = e.detail;
      drawLine(x0, y0, x1, y1, color);
    };
    const handlePeerClear = () => {
      clearCanvasLocal();
    };

    window.addEventListener("peer-draw", handlePeerDraw);
    window.addEventListener("peer-clear", handlePeerClear);

    return () => {
      window.removeEventListener("peer-draw", handlePeerDraw);
      window.removeEventListener("peer-clear", handlePeerClear);
    };
  }, []);

  const clearCanvasLocal = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    clearCanvasLocal();
    if (sendClearEvent) sendClearEvent(); 
  };

  const getNormalizedPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  };

  const drawLine = (x0, y0, x1, y1, color) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
    ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const pos = getNormalizedPos(e);
    lastPosRef.current = pos;
    lastSentPosRef.current = pos;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    if (e.cancelable) e.preventDefault(); 
    
    const currentPos = getNormalizedPos(e);

    drawLine(lastPosRef.current.x, lastPosRef.current.y, currentPos.x, currentPos.y, scribbleColor);
    
    const now = Date.now();
    if (now - lastSendTimeRef.current > 40) { 
       if (sendDrawEvent) sendDrawEvent(lastSentPosRef.current.x, lastSentPosRef.current.y, currentPos.x, currentPos.y, scribbleColor);
       lastSentPosRef.current = currentPos;
       lastSendTimeRef.current = now;
    }

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // 🔥 1-CLICK FIX: Yeh call start karega aur auto-unmute kar dega tumhare liye
  const handleMicClick = async () => {
    if (callState === "IDLE") {
       await startCall(false);
       setTimeout(() => { if (toggleMic) toggleMic(); }, 800); // Wait for stream then unmute
    } else if (callState === "RINGING" && answerCall) {
       await answerCall();
       setTimeout(() => { if (toggleMic) toggleMic(); }, 800);
    } else {
       toggleMic();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 w-full h-full z-[100] flex flex-col bg-[#09090b]">
      
      {/* TOP BAR */}
      <div className="p-4 flex justify-between items-center bg-[#18181b] border-b border-[#27272a]">
        <button onClick={() => setAppState("MODE_SELECTION")} className="p-2 bg-[#27272a] rounded-full text-white active:scale-95 transition-transform"><X size={20} /></button>
        <div className="text-white font-bold tracking-widest text-sm flex items-center gap-2"><Palette size={18} className="text-green-500" /> SCRIBBLE BOARD</div>
        <div className="w-10"></div> 
      </div>

      {/* PLAYER NAMES & MIC */}
      <div className="bg-[#27272a]/40 px-6 py-3 flex justify-between items-center border-b border-[#3f3f46]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md">{studentId?.charAt(0).toUpperCase() || "M"}</div>
          <div className="flex flex-col"><span className="text-white text-[15px] font-semibold tracking-wide">{studentId || "Me"}</span><span className="text-green-400 text-[10px] uppercase tracking-wider font-bold">(You)</span></div>
        </div>

        {/* 🔥 NEW CALL CONTROLS */}
        <div className="flex items-center gap-2">
            <button onClick={handleMicClick} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border-2 ${
                callState === "RINGING" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 animate-pulse" :
                (localStream && !isMicMuted) ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
                {callState === "RINGING" ? <Phone size={22} className="animate-bounce" /> :
                (localStream && !isMicMuted) ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            
            {/* End Call Button */}
            {callState !== "IDLE" && endCall && (
                <button onClick={endCall} className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-500/40 transition-all active:scale-90">
                   <PhoneOff size={18} />
                </button>
            )}
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="flex flex-col"><span className="text-white text-[15px] font-semibold tracking-wide">{targetNode || "Partner"}</span><span className="text-slate-400 text-[10px] uppercase tracking-wider">{isPeerActive ? "Online" : "Away"}</span></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold shadow-md">{targetNode?.charAt(0).toUpperCase() || "P"}</div>
        </div>
      </div>

      {/* THE CANVAS */}
      <div className="flex-1 bg-white relative overflow-hidden touch-none">
        <canvas 
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>

      {/* COLOR PALETTE */}
      <div className="h-24 bg-[#18181b] border-t border-[#27272a] p-4 flex justify-between items-center px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex gap-3">
            {["#000000", "#ef4444", "#3b82f6", "#22c55e", "#eab308"].map(color => (
              <div key={color} onClick={() => setScribbleColor(color)} className={`w-10 h-10 rounded-full cursor-pointer active:scale-90 transition-all shadow-md ${scribbleColor === color ? 'border-4 border-white scale-110' : 'border-2 border-white/20'}`} style={{ backgroundColor: color }}></div>
            ))}
          </div>
          <button onClick={handleClear} className="px-5 py-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl font-medium text-sm hover:bg-rose-500/30 transition-colors active:scale-95">Clear</button>
      </div>
    </motion.div>
  );
}