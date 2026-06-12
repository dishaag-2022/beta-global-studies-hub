import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Beaker, BookOpen, Library, Menu, X, LayoutDashboard, Moon, Sun } from "lucide-react";

export default function DecoyNav({ activeTab, handleTabChange, isMobileMenuOpen, setIsMobileMenuOpen, isDarkMode, setIsDarkMode }) {
  const navItems = [
    { id: "research", label: "Research", icon: <Beaker size={16}/> },
    { id: "courses", label: "Courses", icon: <BookOpen size={16}/> },
    { id: "library", label: "Library", icon: <Library size={16}/> }
  ];

  return (
    <>
      <nav className="border-b border-slate-200/60 dark:border-white/5 py-4 px-6 md:px-8 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl z-50 transition-all duration-500 shadow-sm dark:shadow-none">
        
        {/* LOGO & BETA BADGE */}
        <div onClick={() => handleTabChange("home")} className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
            <GraduationCap size={20} />
          </div>
          <span className="font-black tracking-tight text-slate-800 dark:text-slate-100 text-lg md:text-xl transition-colors">
            Global Studies Archive
            <span className="ml-2 text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold align-middle transition-colors">
              Beta
            </span>
          </span>
        </div>
        
        {/* DESKTOP TABS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {navItems.map((navItem) => (
            <button 
              key={navItem.id}
              onClick={() => handleTabChange(navItem.id)}
              className={`relative flex items-center gap-2 transition-all duration-300 ${activeTab === navItem.id ? "text-indigo-600 dark:text-indigo-400 drop-shadow-sm" : "hover:text-indigo-500 dark:hover:text-slate-200"}`}
            >
              {navItem.icon} {navItem.label}
              {activeTab === navItem.id && <motion.div layoutId="navIndicator" className="absolute -bottom-5 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full" />}
            </button>
          ))}
          
          {/* THEME TOGGLE */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="ml-4 p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300"
          >
            <motion.div initial={false} animate={{ rotate: isDarkMode ? 360 : 0 }}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
          </button>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-amber-400">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300 hover:text-indigo-600">
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-[#18181b] z-[70] shadow-2xl flex flex-col md:hidden border-l border-white/10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <LayoutDashboard size={20}/>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">Menu</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-50 dark:bg-white/5 p-2 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="flex flex-col p-4 gap-2">
                {[{ id: "home", label: "Home", icon: <LayoutDashboard size={20}/> }, ...navItems].map((navItem) => (
                  <button 
                    key={navItem.id} 
                    onClick={() => handleTabChange(navItem.id)} 
                    className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${activeTab === navItem.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                  >
                    {navItem.icon} {navItem.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}