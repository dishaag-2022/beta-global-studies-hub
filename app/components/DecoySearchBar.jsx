import React from 'react';
import { Search } from "lucide-react";

export default function DecoySearchBar({ query, setQuery, handleSearch }) {
  return (
    <div className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 py-6 px-4 md:px-8 sticky top-[72px] z-40 transition-colors duration-500">
      <form onSubmit={handleSearch} className="max-w-4xl mx-auto relative group">
        <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
          <Search size={22} />
        </div>
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search global databases, courses, or encrypted journals..." 
          className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 py-4 pl-14 pr-6 rounded-2xl shadow-inner outline-none focus:bg-white dark:focus:bg-[#18181b] focus:ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" 
        />
      </form>
    </div>
  );
}