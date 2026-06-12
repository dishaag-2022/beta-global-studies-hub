import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronRight, LayoutDashboard, Cpu, TrendingUp, Compass, Monitor, Award, Shield, Zap, Search, Beaker, BookOpen, Library } from "lucide-react";
import DecoyHero from './DecoyHero';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function DecoyMainContent({ activeTab, handleTabChange, filteredData, openReport }) {
  if (activeTab === "home") {
    return (
      <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
        <DecoyHero />
        
        {/* FEATURED RESEARCH SECTION */}
        <section className="py-20 md:py-32 max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3"><LayoutDashboard size={28} className="text-indigo-500 dark:text-indigo-400"/> Featured Research</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-base">Recently curated documents from our top-tier academic network.</p>
            </div>
            <button onClick={() => handleTabChange("research")} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full">View Archive <ChevronRight size={18}/></button>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredData.map((item) => (
              <motion.div 
                variants={itemVariants}
                key={item._id} 
                onClick={() => openReport(item)} 
                className="group relative p-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/5 rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 dark:from-indigo-500/5 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100 z-0"></div>
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-300 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 dark:group-hover:bg-indigo-500 transition-all z-10 shadow-sm"><FileText size={24} /></div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 leading-tight z-10">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow z-10">{item.description}</p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-md">{item.category || "General"}</span>
                  <span className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"><ChevronRight size={18}/></span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ACADEMIC COURSES */}
        <section className="py-24 md:py-32 bg-white dark:bg-[#121214] border-y border-slate-100 dark:border-white/5 relative z-20 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase">Academic Disciplines</motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Comprehensive Course Materials</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Our archives house meticulously curated lecture notes, research papers, and exam preparations across major programs.</p>
            </div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Cpu size={28}/>, title: "Engineering & IT", courses: "B.Tech • M.Tech • BCA", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
                { icon: <TrendingUp size={28}/>, title: "Business & Management", courses: "BBA • MBA • PGDM", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
                { icon: <Compass size={28}/>, title: "Tourism & Hospitality", courses: "BTTM • MTTM • Aviation", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
                { icon: <Monitor size={28}/>, title: "Applied Sciences", courses: "B.Sc • M.Sc • Research", color: "from-violet-500 to-purple-500", bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" }
              ].map((faculty, idx) => (
                <motion.div variants={itemVariants} key={idx} className="relative p-8 bg-[#fafbfc] dark:bg-[#18181b] border border-slate-100 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${faculty.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                  <div className={`w-14 h-14 ${faculty.bg} ${faculty.text} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>{faculty.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{faculty.title}</h3>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">{faculty.courses}</p>
                  <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Lecture Notes</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Previous Year Papers</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Methodologies</li>
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-[#09090b] border-b border-slate-200 dark:border-white/5 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">Uncompromising Academic Integrity</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Our repository is built on strict peer-reviewed standards, ensuring your research is backed by verified data.</p>
            </div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Award size={28}/>, title: "Peer-Reviewed", desc: "Every journal and dataset passes through a rigorous double-blind peer review process." },
                { icon: <Shield size={28}/>, title: "Encrypted Archives", desc: "Historical data and geopolitical policy frameworks are stored using AES-256 encryption." },
                { icon: <Zap size={28}/>, title: "Real-Time Index", desc: "Access the latest shifts in macro-environmental dynamics the moment they are ratified." }
              ].map((feature, idx) => (
                <motion.div variants={itemVariants} key={idx} className="bg-white dark:bg-[#18181b] p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </motion.div>
    );
  }

  // --- OTHER TABS VIEW ---
  return (
    <motion.div key="other-tabs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 min-h-[60vh]">
      <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white capitalize flex items-center gap-3">
          {activeTab === "research" && <Beaker className="text-indigo-600 dark:text-indigo-400" size={36}/>}
          {activeTab === "courses" && <BookOpen className="text-violet-600 dark:text-violet-400" size={36}/>}
          {activeTab === "library" && <Library className="text-blue-600 dark:text-blue-400" size={36}/>}
          Global {activeTab}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">
          {activeTab === "research" && "Exploring geopolitical data and peer-reviewed journals."}
          {activeTab === "courses" && "Interactive academic modules, B.Tech, MBA notes and certification tracks."}
          {activeTab === "library" && "Archived documents, historical records, and policy frameworks."}
        </p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <motion.div 
                variants={itemVariants} layout key={item._id} exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => openReport(item)} 
                className="group relative p-8 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/5 rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-300 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 dark:group-hover:bg-indigo-500 transition-all z-10"><FileText size={24} /></div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 leading-tight z-10">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow z-10">{item.description}</p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-md">{item.category || "General"}</span>
                  <span className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all"><ChevronRight size={18}/></span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-3xl bg-slate-50 dark:bg-[#18181b]/50">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-[#27272a] rounded-full mb-6 text-slate-400 dark:text-slate-500 shadow-sm"><Search size={32} /></div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No records found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">No documents have been classified under this sector yet.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}