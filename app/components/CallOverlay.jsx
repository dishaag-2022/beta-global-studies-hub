import React, { useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Phone, Minimize2, FlipHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CallOverlay({
  callState, isVideoCall, localStream, remoteStream, answerCall, rejectCall, endCall,
  isMicMuted, isVideoMuted, toggleMic, toggleVideo, isRemoteVideoMuted, 
  isRemoteMicMuted, 
  isCallMinimized, setIsCallMinimized, SNAP_FILTERS, localFilter, setLocalFilter, remoteFilter
}) {
  const [isMirrored, setIsMirrored] = useState(true);

  if (callState === "IDLE") return null;

  const nextFilter = (e) => {
    e.stopPropagation();
    setLocalFilter((localFilter + 1) % SNAP_FILTERS.length);
  };

  const prevFilter = (e) => {
    e.stopPropagation();
    setLocalFilter((localFilter - 1 + SNAP_FILTERS.length) % SNAP_FILTERS.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        drag={isCallMinimized}
        dragConstraints={{ top: 10, right: 10, bottom: 100, left: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, borderRadius: isCallMinimized ? 16 : 0 }}
        exit={{ opacity: 0 }}
        onClick={() => isCallMinimized && setIsCallMinimized(false)}
        className={
          isCallMinimized
            ? "fixed bottom-24 right-4 w-28 h-40 bg-[#18181b] rounded-2xl overflow-hidden z-[999] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#3f3f46] cursor-pointer"
            : "fixed inset-0 z-[999] bg-[#09090b] flex flex-col items-center justify-center"
        }
      >
        {/* =========================================
            RINGING STATE (Incoming Call)
        ========================================= */}
        {callState === "RINGING" && !isCallMinimized && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.5)]">
              {isVideoCall ? <Video size={40} className="text-white" /> : <Phone size={40} className="text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Incoming Call...</h2>
            <p className="text-slate-400 mb-10 text-sm">Partner is calling you</p>
            <div className="flex gap-8">
              <button onClick={rejectCall} className="w-16 h-16 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"><PhoneOff size={28} /></button>
              <button onClick={answerCall} className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">{isVideoCall ? <Video size={28} /> : <Phone size={28} />}</button>
            </div>
          </div>
        )}

        {/* =========================================
            ON CALL STATE (Live Video & Controls)
        ========================================= */}
        {callState === "ON_CALL" && (
          <div className="relative w-full h-full bg-black overflow-hidden pointer-events-auto">
            
            {/* TOP BAR: Minimize & Mirror */}
            {!isCallMinimized && (
              <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-50">
                <button onClick={(e) => { e.stopPropagation(); setIsCallMinimized(true); }} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-all">
                  <Minimize2 size={24} />
                </button>

                {isVideoCall && (
                  <button onClick={(e) => { e.stopPropagation(); setIsMirrored(!isMirrored); }} className={`p-3 rounded-full text-white backdrop-blur-md transition-all shadow-lg ${isMirrored ? 'bg-blue-500/80 border border-blue-400' : 'bg-white/10 hover:bg-white/20'}`}>
                    <FlipHorizontal size={20} />
                  </button>
                )}
              </div>
            )}

            {/* OUTGOING CALL RINGING / AUDIO CONNECTED STATE */}
            {(!remoteStream || !isVideoCall) && !isCallMinimized && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border ${remoteStream ? 'bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 animate-pulse border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]'}`}>
                  {isVideoCall ? <Video size={40} className={remoteStream ? "text-emerald-400" : "text-indigo-400"} /> : <Phone size={40} className={remoteStream ? "text-emerald-400" : "text-indigo-400"} />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{remoteStream ? "Call Connected" : "Calling..."}</h2>
                <p className="text-slate-400 text-sm">{remoteStream ? "Audio is active" : "Waiting for partner to pick up"}</p>
                
                {/* SHOW REMOTE MIC OFF STATUS IN AUDIO CALL */}
                {remoteStream && isRemoteMicMuted && (
                   <div className="mt-6 flex items-center gap-2 bg-rose-500/20 text-rose-400 px-4 py-2 rounded-full text-sm font-medium border border-rose-500/30 shadow-lg">
                     <MicOff size={16} /> Partner muted mic
                   </div>
                )}
              </div>
            )}

            {/* 1. REMOTE VIDEO (Them) */}
            <div className={`absolute inset-0 w-full h-full bg-[#09090b] flex items-center justify-center ${(!isVideoCall || !remoteStream) ? 'hidden' : ''}`}>
              <video
                ref={(node) => { if (node && remoteStream && node.srcObject !== remoteStream) node.srcObject = remoteStream; }}
                autoPlay playsInline
                style={{ filter: SNAP_FILTERS[remoteFilter]?.filter || 'none' }} // Partner's Filter
                className={`w-full h-full object-cover transition-opacity duration-300 ${isRemoteVideoMuted ? 'opacity-0' : 'opacity-100'}`}
              />
              
              {isRemoteVideoMuted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18181b] z-10">
                  <VideoOff size={isCallMinimized ? 20 : 40} className="text-slate-400 mb-2" />
                  {!isCallMinimized && <p className="text-slate-300 font-medium tracking-wide">Partner paused video</p>}
                </div>
              )}

              {/* SHOW REMOTE MIC OFF STATUS IN VIDEO CALL OVERLAY */}
              {isRemoteMicMuted && (
                 <div className="absolute top-6 right-6 bg-rose-500/80 backdrop-blur-md p-2.5 rounded-full text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] z-20">
                    <MicOff size={20} />
                 </div>
              )}
            </div>

            {/* 2. LOCAL VIDEO (You) - PiP Box */}
            <motion.div
              drag={!isCallMinimized}
              dragConstraints={{ top: 20, right: 20, bottom: 120, left: 20 }}
              className={
                isCallMinimized
                  ? `absolute bottom-2 right-2 w-8 h-12 bg-[#18181b] rounded-md overflow-hidden border border-[#27272a] z-50 shadow-lg ${!isVideoCall ? 'hidden' : ''}`
                  : `absolute top-20 right-4 w-28 h-40 bg-[#18181b] rounded-xl overflow-hidden shadow-2xl border border-[#27272a] z-50 ${!isVideoCall ? 'hidden' : ''}`
              }
            >
              <video
                ref={(node) => { if (node && localStream && node.srcObject !== localStream) node.srcObject = localStream; }}
                autoPlay playsInline muted 
                style={{
                  filter: SNAP_FILTERS[localFilter]?.filter || 'none', // Your Filter
                  transform: isMirrored ? 'scaleX(-1)' : 'none' // Mirror Fix
                }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoMuted ? 'opacity-0' : 'opacity-100'}`} 
              />
              
              {/* IF LOCAL VIDEO IS OFF */}
              {isVideoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#27272a] z-10">
                  <VideoOff size={isCallMinimized ? 12 : 28} className="text-slate-400" />
                </div>
              )}

              {/* 🔥 FIXED: LOCAL MIC MUTE INDICATOR FOR YOUR SMALL PHOTO */}
              {isMicMuted && (
                 <div className="absolute bottom-2 right-2 bg-rose-500/90 backdrop-blur-md p-1.5 rounded-full text-white shadow-lg z-20">
                    <MicOff size={14} />
                 </div>
              )}
            </motion.div>

            {/* FILTER CAROUSEL */}
            {!isCallMinimized && isVideoCall && (
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
                <button onClick={prevFilter} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
                  <ChevronLeft size={20} />
                </button>

                <div className="px-6 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-white flex items-center gap-2 shadow-xl min-w-[120px] justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest">{SNAP_FILTERS[localFilter].name}</span>
                </div>

                <button onClick={nextFilter} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* 3. CALL CONTROLS */}
            {!isCallMinimized && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#18181b]/80 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-[#27272a] shadow-2xl z-50">
                <button onClick={(e) => { e.stopPropagation(); toggleMic(); }} className={`p-4 rounded-full transition-colors ${isMicMuted ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-[#27272a] text-white hover:bg-[#3f3f46]'}`}>
                  {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                {isVideoCall && (
                  <button onClick={(e) => { e.stopPropagation(); toggleVideo(); }} className={`p-4 rounded-full transition-colors ${isVideoMuted ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-[#27272a] text-white hover:bg-[#3f3f46]'}`}>
                    {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); endCall(); }} className="p-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                  <PhoneOff size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}