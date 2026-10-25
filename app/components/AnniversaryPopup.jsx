import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, Heart, Volume2, VolumeX } from 'lucide-react';

const MagicalSparkles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 3 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute text-amber-200 blur-[1px]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 10 + 10}px`,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

export default function AnniversaryPopup({ onContinue }) {
    // AUDIO CONTROLS & MUTE LOGIC
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.log("Autoplay blocked, needs click"));
        }
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // 🔥 NEW: Toggle Mute
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    // DYNAMIC COUNTDOWN TIMER
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date("2026-12-25T00:00:00").getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            key="anniversary-design"
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center z-[200] bg-[#0c0507] overflow-hidden sm:p-4"
            style={{
                backgroundImage: `radial-gradient(circle at top right, #38121d 0%, #0c0507 60%), radial-gradient(circle at bottom left, #27151a 0%, #0c0507 60%)`
            }}
        >
            <audio 
                ref={audioRef} 
                src="/song.mp3" 
                loop 
                onTimeUpdate={handleTimeUpdate} 
            />

            <MagicalSparkles />

            {/* MAIN GLOWING CARD */}
            <div className="relative w-full h-full sm:max-w-md sm:h-[95dvh] sm:rounded-[40px] flex flex-col items-center justify-between border border-[#e5a092]/30 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(229,160,146,0.15)] overflow-y-auto overflow-x-hidden scrollbar-hide">
                
                {/* 🔥 TOP CONTROLS: Mute & Close Buttons */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                    <button 
                        onClick={toggleMute}
                        className="p-2 rounded-full border border-[#e5a092]/50 text-[#e5a092] hover:bg-[#e5a092]/10 transition-colors backdrop-blur-md"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button 
                        onClick={onContinue}
                        className="p-2 rounded-full border border-[#e5a092]/50 text-[#e5a092] hover:bg-[#e5a092]/10 transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* --- HEADER --- */}
                <div className="flex flex-col items-center mt-10 mb-4 z-10">
                    <h2 className="text-[#e5a092] text-xl tracking-[0.3em] uppercase font-serif mb-[-10px] z-10">To My</h2>
                    <h1 
                        className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffdfd3] to-[#e5a092] drop-shadow-[0_0_15px_rgba(229,160,146,0.5)]"
                        style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontWeight: 400 }}
                    >
                        Chaand <span className="text-4xl">🌙</span>
                    </h1>
                </div>

                {/* --- PHOTO & POLAROID NOTES --- */}
                <div className="relative w-[85%] aspect-square mt-2 mb-8 z-10 flex items-center justify-center">
                    
                    {/* Sticky Note Left */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30, rotate: -20 }}
                        animate={{ opacity: 1, x: 0, rotate: -8 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="absolute -left-6 top-8 w-28 p-3 bg-[#fdf5e6] text-[#4a3b32] text-[11px] leading-tight font-serif shadow-xl rounded-sm z-20 border border-[#e0d6c8]"
                    >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 shadow-sm rotate-3"></div>
                        <p className="text-center italic">4 years of you, me and all our beautiful memories ♡</p>
                    </motion.div>

                    {/* Sticky Note Top Right */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30, rotate: 20 }}
                        animate={{ opacity: 1, x: 0, rotate: 6 }}
                        transition={{ delay: 0.7, type: "spring" }}
                        className="absolute -right-4 -top-2 w-24 p-2.5 bg-[#2a2428] text-[#e5a092] text-[10px] leading-relaxed font-serif shadow-xl rounded-sm z-20 border border-[#e5a092]/30"
                    >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/10 shadow-sm -rotate-2"></div>
                        <p className="text-center italic">Same Sky<br/>Same Us<br/>Always<br/>♡</p>
                    </motion.div>

                    {/* Main Polaroid Photo */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-[90%] h-[90%] p-2 pb-6 bg-[#fdf5e6] shadow-2xl rounded-sm border border-[#e0d6c8] z-10 rotate-1"
                    >
                        <img src="/us.jpg" alt="Us" className="w-full h-full object-cover rounded-sm border border-black/10" />
                    </motion.div>

                    {/* Sticky Note Bottom Right */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30, rotate: 20 }}
                        animate={{ opacity: 1, y: 0, rotate: -4 }}
                        transition={{ delay: 0.9, type: "spring" }}
                        className="absolute -right-5 bottom-4 w-32 p-3 bg-[#fdf5e6] text-[#4a3b32] text-[10px] leading-relaxed font-serif shadow-xl rounded-sm z-20 border border-[#e0d6c8]"
                    >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 shadow-sm rotate-2"></div>
                        <p>✓ Same partner<br/>✓ Same chaos<br/>✓ Same dreams<br/>✓ Many more years to go ♡</p>
                    </motion.div>
                </div>

                {/* --- COUNTDOWN TIMER SECTION --- */}
                <div className="w-[90%] flex flex-col items-center bg-black/40 border border-[#e5a092]/30 rounded-2xl p-5 backdrop-blur-md z-10 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6">
                    <h3 className="text-[#e5a092] text-xs font-bold tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
                        ♡ Our 4th Anniversary In ♡
                    </h3>
                    
                    <div className="flex w-full justify-between items-center gap-2">
                        <div className="flex flex-col items-center flex-1 border border-[#e5a092]/30 rounded-xl py-3 bg-black/20">
                            <span className="text-3xl font-serif text-[#ffdfd3]">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="text-[9px] text-[#e5a092] uppercase tracking-wider mt-1">Days</span>
                        </div>
                        <span className="text-[#e5a092]/50 text-xl font-thin">:</span>
                        <div className="flex flex-col items-center flex-1 border border-[#e5a092]/30 rounded-xl py-3 bg-black/20">
                            <span className="text-3xl font-serif text-[#ffdfd3]">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[9px] text-[#e5a092] uppercase tracking-wider mt-1">Hours</span>
                        </div>
                        <span className="text-[#e5a092]/50 text-xl font-thin">:</span>
                        <div className="flex flex-col items-center flex-1 border border-[#e5a092]/30 rounded-xl py-3 bg-black/20">
                            <span className="text-3xl font-serif text-[#ffdfd3]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[9px] text-[#e5a092] uppercase tracking-wider mt-1">Minutes</span>
                        </div>
                        <span className="text-[#e5a092]/50 text-xl font-thin">:</span>
                        <div className="flex flex-col items-center flex-1 border border-[#e5a092]/30 rounded-xl py-3 bg-black/20">
                            <span className="text-3xl font-serif text-[#ffdfd3]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[9px] text-[#e5a092] uppercase tracking-wider mt-1">Seconds</span>
                        </div>
                    </div>

                    <div className="mt-5 w-full flex items-center justify-center gap-3 opacity-60">
                        <div className="h-px bg-[#e5a092] flex-1"></div>
                        <span className="text-[#e5a092] text-[10px] tracking-[0.2em] uppercase font-bold">25 December 2026</span>
                        <div className="h-px bg-[#e5a092] flex-1"></div>
                    </div>
                    <div className="text-[#e5a092] text-xs mt-1 opacity-60">♡</div>

                    <p className="mt-3 text-[#ffdfd3] font-serif italic text-[13px] tracking-wide text-center px-4">
                        "In every lifetime, I'd still find my way to you. ♡"
                    </p>
                </div>

                {/* --- MUSIC PLAYER --- */}
                <div className="w-[90%] flex items-center justify-between p-4 mb-6 z-10 border-t border-[#e5a092]/20">
                    
                    <div className="relative w-16 h-16 rounded-full bg-black border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0">
                        <motion.div 
                            animate={{ rotate: isPlaying ? 360 : 0 }} 
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center"
                            style={{ backgroundImage: 'repeating-radial-gradient(circle, #27272a 0, #27272a 2px, #18181b 3px, #18181b 4px)' }}
                        >
                            <div className="w-6 h-6 bg-rose-400 rounded-full border-2 border-black flex items-center justify-center">
                                <Heart size={10} className="text-white fill-white" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex-1 px-4 flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h4 className="text-[#ffdfd3] text-sm font-serif font-bold tracking-wide">My Moonlight ♡</h4>
                                <p className="text-[#e5a092] text-[10px] italic">forever with you...</p>
                            </div>
                            <Heart size={16} className="text-[#e5a092]" />
                        </div>
                        
                        <div className="w-full h-1 bg-[#e5a092]/30 rounded-full mb-3 flex items-center">
                            <motion.div 
                                className="h-full bg-[#ffdfd3] rounded-full relative" 
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_5px_#fff]"></div>
                            </motion.div>
                        </div>

                        <div className="flex items-center justify-between px-2 text-[#e5a092]">
                            <Shuffle size={14} className="opacity-70 cursor-pointer" />
                            <SkipBack size={16} className="fill-current cursor-pointer" />
                            <button 
                                onClick={togglePlay} 
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5a092] hover:bg-[#e5a092]/20 transition-colors"
                            >
                                {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                            </button>
                            <SkipForward size={16} className="fill-current cursor-pointer" />
                            <Repeat size={14} className="opacity-70 cursor-pointer" />
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}