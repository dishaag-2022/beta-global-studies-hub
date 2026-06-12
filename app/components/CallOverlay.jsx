import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, User } from 'lucide-react';

export default function CallOverlay({
  callState, 
  isVideoCall, 
  localStream, 
  remoteStream,
  answerCall, 
  rejectCall, 
  endCall,
  isMicMuted, 
  isVideoMuted, 
  toggleMic, 
  toggleVideo
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (callState === "IDLE") return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-[#09090b]/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      
      {/* 1. RINGING STATE */}
      {callState === "RINGING" && (
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
              {isVideoCall ? <Video size={32} className="text-white" /> : <Phone size={32} className="text-white animate-bounce" />}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Incoming Call...</h2>
          <p className="text-slate-400 mb-12">Target Node is calling you</p>
          <div className="flex gap-8">
            <button onClick={rejectCall} className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all"><PhoneOff size={28} className="text-white" /></button>
            <button onClick={answerCall} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 transition-all"><Phone size={28} className="text-white" /></button>
          </div>
        </div>
      )}

      {/* 2. ON CALL STATE */}
      {callState === "ON_CALL" && (
        <div className="w-full h-full flex flex-col items-center justify-center relative max-w-4xl mx-auto overflow-hidden">
          
          <div className="w-full h-[70vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative border border-[#27272a] flex items-center justify-center">
            
            {/* WAITING UI */}
            {!remoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] z-0">
                <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 animate-pulse border border-zinc-700">
                  <User size={40} className="text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200">Calling...</h3>
                <p className="text-sm text-slate-500 animate-pulse">Waiting for answer</p>
              </div>
            )}

            {/* VIDEO CALL LOGIC */}
            {isVideoCall ? (
              <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover relative z-10 ${!remoteStream ? 'hidden' : 'block'}`} />
            ) : (
              /* AUDIO CALL LOGIC - Avatar UI */
              <div className={`flex flex-col items-center gap-4 relative z-10 ${!remoteStream ? 'hidden' : 'flex'}`}>
                <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                  <User size={64} className="text-emerald-500" />
                </div>
                <span className="text-emerald-500 font-medium tracking-widest uppercase text-sm animate-pulse">Voice Call Connected</span>
              </div>
            )}
            
            {/* ---> NEW: DRAGGABLE LOCAL VIDEO PIP <--- */}
            {isVideoCall && (
              <motion.div 
                drag
                dragConstraints={{ top: 0, left: -250, right: 0, bottom: 400 }}
                dragElastic={0.1}
                whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                className="absolute top-4 right-4 w-28 h-40 bg-zinc-800 rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700/50 z-20 group cursor-grab touch-none"
              >
                <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover pointer-events-none ${isVideoMuted ? 'hidden' : ''}`} />
                {isVideoMuted && <div className="w-full h-full flex items-center justify-center bg-zinc-900 pointer-events-none"><VideoOff size={24} className="text-slate-500" /></div>}
                
                <button 
                  onClick={toggleMic}
                  onPointerDown={(e) => e.stopPropagation()} // Prevents dragging when clicking the mic
                  className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-md p-1.5 rounded-full shadow-lg transition-colors cursor-pointer z-30"
                >
                  {isMicMuted ? <MicOff size={14} className="text-rose-500" /> : <Mic size={14} className="text-emerald-500" />}
                </button>
              </motion.div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="absolute bottom-10 flex gap-6 px-8 py-4 bg-[#18181b]/80 backdrop-blur-xl border border-[#27272a] rounded-full shadow-2xl">
            <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicMuted ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'}`}>
              {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={toggleVideo} disabled={!isVideoCall} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isVideoCall ? 'opacity-30' : isVideoMuted ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'}`}>
              {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <button onClick={endCall} className="w-14 h-14 bg-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all">
              <PhoneOff size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}