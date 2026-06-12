import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import { Database, Globe, Users, Shield } from "lucide-react";

export default function DecoyHero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <>
      <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 md:pb-32 text-center border-b border-slate-100 dark:border-white/5 px-4 transition-colors duration-500">
        {/* Animated Background Orbs */}
        <motion.div style={{ y: y1 }} className="absolute -top-32 -left-20 w-80 md:w-96 h-80 md:h-96 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 z-0 animate-pulse duration-1000" />
        <motion.div style={{ y: y2 }} className="absolute top-20 -right-20 w-64 md:w-80 h-64 md:h-80 bg-violet-500/20 dark:bg-fuchsia-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 z-0 animate-pulse duration-1000 delay-500" />
        
        <motion.div style={{ opacity: opacityHero }} className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block mb-6 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm transition-colors">
            Open Source Academic Intelligence
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 100 }} className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight drop-shadow-sm">
            Advancing Global Knowledge <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
              Beyond Borders.
            </span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium leading-relaxed">
            Access peer-reviewed journals, policy frameworks, and comprehensive course materials curated by the world's leading research institutions.
          </motion.p>
        </motion.div>
      </section>

      <section className="py-10 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-slate-100 dark:border-white/5 relative z-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:divide-x divide-slate-200 dark:divide-white/10">
          <div className="text-center px-2"><Database className="mx-auto text-indigo-500 dark:text-indigo-400 mb-3" size={28}/><h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">12.5M+</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Indexed Papers</p></div>
          <div className="text-center px-2"><Globe className="mx-auto text-violet-500 dark:text-violet-400 mb-3" size={28}/><h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">140+</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Global Partners</p></div>
          <div className="text-center px-2 mt-4 md:mt-0"><Users className="mx-auto text-blue-500 dark:text-blue-400 mb-3" size={28}/><h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">850k</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Active Researchers</p></div>
          <div className="text-center px-2 mt-4 md:mt-0"><Shield className="mx-auto text-emerald-500 dark:text-emerald-400 mb-3" size={28}/><h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">99.9%</h3><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Data Integrity</p></div>
        </div>
      </section>
    </>
  );
}