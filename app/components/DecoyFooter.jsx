import React from 'react';
import { GraduationCap, Shield, Send } from "lucide-react";

export default function DecoyFooter({ contactForm, setContactForm, isSending, handleContactSubmit }) {
  return (
    <footer className="bg-[#0a0f1c] text-slate-400 py-16 border-t border-slate-800 relative z-10 pb-24 md:pb-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap size={32} className="text-indigo-500" />
              <span className="font-black tracking-tight text-white text-2xl">Global Studies Archive</span>
            </div>
            <p className="text-base leading-relaxed mb-6 md:pr-10 text-slate-400">
              Dedicated to the preservation, peer-review, and global distribution of socio-economic and geopolitical research. Empowering academics worldwide through secure intelligence sharing.
            </p>
          </div>
          
          <div className="bg-[#121827] border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">Contact Registry <Send size={18} className="text-indigo-500"/></h4>
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" placeholder="Full Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl px-5 py-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                <input required type="email" placeholder="Email Address" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl px-5 py-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>
              <textarea required placeholder="Research Inquiry / Message" rows="4" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"></textarea>
              <button disabled={isSending} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:-translate-y-0.5">
                {isSending ? "Sending Payload..." : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-center md:text-left">
          <p>© 2026 Global Studies Archive Beta. Department of Advanced Academic Research.</p>
          <p className="flex items-center gap-2 justify-center font-mono text-xs"><Shield size={16} className="text-emerald-500"/> System Ver 4.2.1-stable. AES-256 Encrypted.</p>
        </div>
      </div>
    </footer>
  );
}