import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import { Database, Globe, Users, Shield } from "lucide-react";

// 🔥 NATIVE "3JS-STYLE" PARTICLE NETWORK SYSTEM
const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle Class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8; // Speed X
        this.vy = (Math.random() - 0.5) * 0.8; // Speed Y
        this.radius = Math.random() * 1.5 + 0.5; // Dot size
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.6)'; // Indigo color
        ctx.fill();
      }
    }

    // Initialize 120 particles
    for (let i = 0; i < 120; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles with lines
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) { // Connection radius
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.25 - distance / 480})`; // Violet fade
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-70 transition-opacity duration-500" 
    />
  );
};

export default function DecoyHero() {
  const { scrollY } = useScroll();
  // 🔥 Parallax effect on the text and stats
  const yText = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <>
      <section className="relative overflow-hidden pt-24 md:pt-40 pb-24 md:pb-40 text-center border-b border-slate-100 dark:border-white/5 px-4 transition-colors duration-500 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-indigo-950/10">
        
        {/* 🔥 THE NEW 3D-STYLE PARTICLE NETWORK */}
        <ParticleNetwork />
        
        {/* Glowing Orbs behind the text for extra depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <motion.div style={{ y: yText, opacity: opacityHero }} className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block mb-6 px-5 py-2 rounded-full bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm backdrop-blur-md transition-colors">
            Open Source Academic Intelligence
          </motion.div>
          
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 100 }} className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-[1.1] drop-shadow-sm">
            Advancing Global Knowledge <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-fuchsia-400 dark:to-cyan-400 animate-gradient-x">
              Beyond Borders.
            </span>
          </motion.h1>
          
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base md:text-xl font-medium leading-relaxed">
            Access peer-reviewed journals, policy frameworks, and comprehensive course materials curated by the world's leading research institutions.
          </motion.p>
        </motion.div>
      </section>

      {/* Floating Glassmorphism Stats Bar */}
      <section className="relative z-20 -mt-12 mb-10 px-4">
        <div className="max-w-6xl mx-auto bg-white/70 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-indigo-500/5 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-x-0 md:divide-x divide-slate-200 dark:divide-white/10 transition-colors duration-500">
          <div className="text-center px-2 hover:scale-105 transition-transform"><Database className="mx-auto text-indigo-500 dark:text-indigo-400 mb-3 drop-shadow-md" size={32}/><h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">12.5M+</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Indexed Papers</p></div>
          <div className="text-center px-2 hover:scale-105 transition-transform"><Globe className="mx-auto text-violet-500 dark:text-violet-400 mb-3 drop-shadow-md" size={32}/><h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">140+</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Global Partners</p></div>
          <div className="text-center px-2 mt-4 md:mt-0 hover:scale-105 transition-transform"><Users className="mx-auto text-cyan-500 dark:text-cyan-400 mb-3 drop-shadow-md" size={32}/><h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">850k</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Active Researchers</p></div>
          <div className="text-center px-2 mt-4 md:mt-0 hover:scale-105 transition-transform"><Shield className="mx-auto text-emerald-500 dark:text-emerald-400 mb-3 drop-shadow-md" size={32}/><h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100">99.9%</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Data Integrity</p></div>
        </div>
      </section>
    </>
  );
}