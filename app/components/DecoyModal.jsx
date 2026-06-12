import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Database } from "lucide-react";

export default function DecoyModal({ selectedReport, setSelectedReport }) {
  return (
    <AnimatePresence>
      {selectedReport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md" onClick={() => setSelectedReport(null)}>
          <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#18181b] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-white/10">
            <div className="flex justify-between items-start p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <div className="pr-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-3 py-1.5 rounded-md mb-4 inline-block">{selectedReport.category || "Classified Document"}</span>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">{selectedReport.title}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-3 bg-white dark:bg-[#27272a] rounded-full text-slate-400 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm border border-slate-200 dark:border-white/5 flex-shrink-0"><X size={20} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white dark:bg-[#18181b] flex-1 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base custom-scrollbar">
              {selectedReport.fullContent}
            </div>
            
            <div className="p-6 md:px-8 md:py-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center gap-2"><Database size={16}/> Doc ID: {selectedReport._id?.substring(0, 10) || "N/A"}</p>
              <button onClick={() => setSelectedReport(null)} className="w-full md:w-auto px-8 py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-600/30">Close Archive</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}