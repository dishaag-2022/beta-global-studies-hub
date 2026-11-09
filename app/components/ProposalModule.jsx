"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Sparkles, ChevronUp, Camera } from 'lucide-react';

export default function ProposalModule({ setAppState }) {
  const [step, setStep] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState(false);

  // Cinematic Text Timings
  useEffect(() => {
    if (step === 0) setTimeout(() => setStep(1), 3500); // 1st line
    if (step === 1) setTimeout(() => setStep(2), 3500); // 2nd line
    if (step === 2) setTimeout(() => setStep(3), 4000); // 3rd line
    // Step 3 is the Swipe Box
  }, [step]);

  // Runaway NO Button Logic
  const handleNoInteraction = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setNoPosition({
      x: Math.random() * 250 - 125, // Moves randomly horizontally
      y: Math.random() * 250 - 125  // Moves randomly vertically
    });
  };

  const handleYesClick = () => {
    setFlash(true);
    if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
    setTimeout(() => {
      setStep(5); // Final romantic screen
      setFlash(false);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 w-full h-[100dvh] bg-[#050002] z-[999] flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Background Romantic Music */}
      <audio src="/song.mp3" autoPlay loop className="hidden" />

      {/* FLASH EFFECT FOR CAMERA SNAP */}
      <AnimatePresence>
        {flash && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 bg-white z-[1000]" />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {/* CINEMATIC TEXTS */}
        {step === 0 && (
          <motion.h1 key="text1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1 }} className="text-rose-200 text-xl md:text-2xl font-serif italic text-center px-8">
            "I know things have been hard lately..."
          </motion.h1>
        )}
        
        {step === 1 && (
          <motion.h1 key="text2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1 }} className="text-rose-200 text-xl md:text-2xl font-serif italic text-center px-8">
            "I know your Marshmallow messed up..."
          </motion.h1>
        )}

        {step === 2 && (
          <motion.h1 key="text3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1 }} className="text-rose-200 text-xl md:text-2xl font-serif italic text-center px-8">
            "But my today, my tomorrow, and my forever... <br/><br/> make no sense without you."
          </motion.h1>
        )}

        {/* SWIPE TO OPEN BOX */}
        {step === 3 && (
          <motion.div key="box" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full w-full relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0,transparent_60%)] pointer-events-none" />
            
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y < -50) { // If swiped up
                  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                  setStep(4);
                }
              }}
              className="relative cursor-grab active:cursor-grabbing flex items-center justify-center p-8 z-20"
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-8xl drop-shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                🎁
              </motion.div>
            </motion.div>
            
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute bottom-32 flex flex-col items-center text-rose-300 gap-2">
              <ChevronUp size={28} className="animate-bounce" />
              <p className="text-sm font-bold uppercase tracking-widest">Swipe up to open</p>
            </motion.div>
          </motion.div>
        )}

        {/* THE PROPOSAL & RUNAWAY BUTTON */}
        {step === 4 && (
          <motion.div key="proposal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center w-full h-full relative px-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.3)_0,transparent_80%)] pointer-events-none" />
            
            {/* Ring pops up */}
            <motion.div initial={{ y: 50, scale: 0, rotate: -20 }} animate={{ y: -20, scale: 1.2, rotate: 0 }} transition={{ type: "spring", damping: 12, duration: 1.5 }} className="text-8xl drop-shadow-[0_0_50px_rgba(251,191,36,0.8)] mb-8 relative z-20">
              💍
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl md:text-4xl font-black text-center text-white drop-shadow-md mb-12 z-20 leading-tight">
              Will you marry me, <br/> <span className="text-rose-400">Dishi?</span>
            </motion.h1>

            <div className="flex gap-4 relative w-full justify-center h-20 items-center z-50">
              <motion.button 
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: "spring" }}
                onClick={handleYesClick}
                className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black uppercase tracking-wider shadow-[0_0_30px_rgba(225,29,72,0.6)] active:scale-95 transition-all text-sm md:text-base flex items-center gap-2"
              >
                Yes, I'm yours! <Heart size={18} className="fill-white animate-pulse" />
              </motion.button>
              
              {/* RUNAWAY NO BUTTON */}
              <motion.button 
                initial={{ opacity: 0 }} animate={{ opacity: 1, x: noPosition.x, y: noPosition.y }} transition={{ type: "spring", stiffness: 300, damping: 20, opacity: { delay: 1 } }}
                onPointerDown={handleNoInteraction} 
                onMouseEnter={handleNoInteraction}
                style={{ touchAction: 'none' }}
                className="px-6 py-4 bg-zinc-800 text-slate-300 rounded-full font-bold uppercase tracking-wider shadow-lg text-sm md:text-base border border-zinc-700 absolute right-10"
              >
                No 😡
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* FINAL SCREEN (AFTER SAYING YES) */}
        {step === 5 && (
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