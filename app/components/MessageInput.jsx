import React, { useState, useEffect } from 'react';
import { Send, Smile, Camera, Image as ImageIcon, Sticker, Heart, X, Reply, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({
  inputRef, input, setInput, handleInputChange, isUploading,
  showEmojis, setShowEmojis, cameraInputRef, galleryInputRef, isDarkMode, 
  isLoveMode, ignorePanicRef, scrollToBottom, dispatchMessage, setAppState,
  replyTo, setReplyTo // 🔥 NEW PROPS
}) {
  const [showStickers, setShowStickers] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [stickerSearch, setStickerSearch] = useState("");
  const [loadingGifs, setLoadingGifs] = useState(false);

  const fetchGifs = async (query) => {
    setLoadingGifs(true);
    const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
    const endpoint = query.trim() ? `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=30` : `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=30`;
    try { const res = await fetch(endpoint); const data = await res.json(); setGifs(data.data || []); } catch(e) {}
    setLoadingGifs(false);
  };
  
  useEffect(() => { if (!showStickers) return; const t = setTimeout(() => fetchGifs(stickerSearch), 500); return () => clearTimeout(t); }, [stickerSearch, showStickers]);
  
  const handleStickerSend = (url) => { if(dispatchMessage) { dispatchMessage(`STK_SYS::${url}`); setShowStickers(false); setStickerSearch(""); setTimeout(scrollToBottom, 100); } };
  const toggleEmojis = () => { setShowEmojis(!showEmojis); setShowStickers(false); };
  const toggleStickers = () => { setShowStickers(!showStickers); setShowEmojis(false); };

  // 🔥 CUSTOM SUBMIT TO HANDLE REPLIES
  const onCustomSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() && !isUploading) return;
    
    let finalMsg = input;
    if (replyTo && input.trim()) {
       finalMsg = `RPL_SYS|||${replyTo.text}|||${input}`;
    }
    
    if (input.trim()) {
       dispatchMessage(finalMsg);
    }
    
    setInput("");
    setShowEmojis(false);
    if(setReplyTo) setReplyTo(null);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col w-full z-20 relative">
      
      {/* ============================================================== */}
      {/* 🔥 FIX: YAHAN SE EMOJI AUR STICKER POPUP GAYAB THA, ADDED BACK! */}
      {/* ============================================================== */}
      
      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`absolute bottom-[75px] left-2 sm:left-4 z-50 shadow-2xl rounded-3xl overflow-hidden border ${isLoveMode ? "bg-[#2a0a12] border-rose-900/50" : isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-white border-slate-200"}`}>
            <EmojiPicker onEmojiClick={(emoji) => setInput(p => p + emoji.emoji)} theme={isDarkMode || isLoveMode ? "dark" : "light"} width={280} height={320} previewConfig={{ showPreview: false }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Giphy Search & Picker Panel */}
      <AnimatePresence>
        {showStickers && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`absolute bottom-[75px] left-2 sm:left-4 z-50 shadow-2xl rounded-3xl p-3 w-[300px] h-[360px] flex flex-col border ${isLoveMode ? "bg-[#2a0a12] border-rose-900/50" : isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-white border-slate-200"}`}>
            
            {/* Search Bar */}
            <div className={`flex items-center px-3 py-2 mb-3 rounded-xl border ${isLoveMode ? "bg-[#1a050f] border-rose-900/80" : isDarkMode ? "bg-[#09090b] border-[#3f3f46]" : "bg-slate-50 border-slate-200"}`}>
              <Search size={16} className={isLoveMode ? "text-pink-500" : isDarkMode ? "text-slate-400" : "text-slate-500"} />
              <input 
                type="text" placeholder="Search Memes..." value={stickerSearch} onChange={(e) => setStickerSearch(e.target.value)}
                className={`w-full ml-2 bg-transparent outline-none text-sm ${isLoveMode ? "text-rose-200 placeholder-rose-800" : isDarkMode ? "text-slate-200 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
              />
            </div>

            {/* GIF Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 scrollbar-hide pr-1">
              {loadingGifs ? (
                <div className="col-span-3 flex items-center justify-center h-full text-sm font-medium animate-pulse text-rose-400">Loading Memes...</div>
              ) : gifs.length > 0 ? (
                gifs.map((gif) => (
                  <div key={gif.id} onClick={() => handleStickerSend(gif.images.fixed_height.url)} className={`cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-1 rounded-xl h-20 ${isLoveMode ? "hover:bg-rose-900/30" : isDarkMode ? "hover:bg-[#27272a]" : "hover:bg-slate-100"}`}>
                    <img src={gif.images.fixed_height_small.url} alt={gif.title} className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md" />
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex items-center justify-center h-full text-sm opacity-50">No stickers found</div>
              )}
            </div>
            
            <div className="text-[10px] text-center mt-2 opacity-50 font-bold tracking-widest uppercase">Powered by GIPHY</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}


      {/* 🔥 REPLY BANNER (Shows up when you swipe right) */}
      <AnimatePresence>
        {replyTo && (
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className={`mx-4 mb-2 p-3 rounded-xl flex justify-between items-center shadow-lg border-l-4 ${isLoveMode ? "bg-[#2a0a12] border-pink-500 text-rose-200" : isDarkMode ? "bg-[#18181b] border-blue-500 text-slate-300" : "bg-white border-blue-500 text-slate-700"}`}>
             <div className="flex flex-col truncate pr-4">
                <span className={`text-xs font-bold flex items-center gap-1 ${isLoveMode ? "text-pink-400" : "text-blue-500"}`}><Reply size={12}/> Replying to</span>
                <span className="text-sm truncate opacity-80 mt-0.5">
                   {replyTo.text.startsWith("IMG_SYS") ? "📷 Photo" : replyTo.text.startsWith("VID_SYS") ? "🎥 Video" : replyTo.text.startsWith("STK_SYS") ? "✨ Sticker" : replyTo.text.split("|||").pop()}
                </span>
             </div>
             <button onClick={() => setReplyTo(null)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><X size={16}/></button>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Text Bar */}
      <div className={`w-full p-3 shrink-0 border-t transition-colors duration-500 ${isLoveMode ? "bg-[#1a050f] border-rose-900/50" : (isDarkMode ? "bg-[#09090b] border-[#27272a]" : "bg-[#f4f5f9] border-slate-200")}`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-full mx-auto flex gap-2 items-center relative z-20">
          
          <div className={`flex-1 flex items-center rounded-full px-2 py-1 border transition-all shadow-sm relative z-20 h-[48px] ${isLoveMode ? "bg-[#2a0a12] border-rose-900 focus-within:border-pink-500 shadow-[0_0_15px_rgba(225,29,72,0.1)]" : (isDarkMode ? "bg-[#18181b] border-[#3f3f46] focus-within:border-blue-500" : "bg-white border-slate-200 focus-within:border-blue-500")}`}>
            
            <div className="flex items-center">
              <button type="button" onClick={toggleEmojis} className={`p-1.5 transition-colors ${showEmojis ? (isLoveMode ? "text-pink-500" : "text-blue-500") : isLoveMode ? "text-rose-400/70 hover:text-rose-300" : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Smile size={22} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={toggleStickers} className={`p-1.5 transition-colors ${showStickers ? (isLoveMode ? "text-pink-500" : "text-blue-500") : isLoveMode ? "text-rose-400/70 hover:text-rose-300" : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Sticker size={22} strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={onCustomSubmit} className="flex-1 flex items-center h-full px-1">
              <input 
                ref={inputRef} type="text" value={input} onChange={handleInputChange} onFocus={() => setTimeout(scrollToBottom, 300)} 
                className={`flex-1 bg-transparent border-none text-[16px] outline-none h-full w-full transition-colors ${isLoveMode ? "text-rose-100 placeholder-rose-900" : isDarkMode ? "text-slate-200 placeholder-slate-500" : "text-slate-700 placeholder-slate-400"}`} 
                placeholder={isUploading ? "Sending photo..." : "Message..."} 
                autoComplete="off" disabled={isUploading} 
              />
            </form>

            <div className="flex gap-0.5 items-center shrink-0 pr-1">
              <button type="button" disabled={isUploading} onClick={(e) => { e.preventDefault(); if (ignorePanicRef) ignorePanicRef.current = true; setAppState("SNAP_MODE"); }} className={`p-1.5 disabled:opacity-50 transition-transform active:scale-90 ${isLoveMode ? "text-rose-400/70 hover:text-rose-300" : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Camera size={22} strokeWidth={1.5} />
              </button>
              <button type="button" disabled={isUploading} onClick={(e) => { e.preventDefault(); if (ignorePanicRef) ignorePanicRef.current = true; galleryInputRef.current?.click(); }} className={`p-1.5 disabled:opacity-50 transition-transform active:scale-90 ${isLoveMode ? "text-rose-400/70 hover:text-rose-300" : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <ImageIcon size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <button 
            onClick={onCustomSubmit} onPointerDown={(e) => e.preventDefault()} disabled={!input.trim() && !isUploading} 
            className={`w-[48px] h-[48px] shrink-0 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm relative z-20 will-change-transform ${(!input.trim() && !isUploading) ? (isLoveMode ? 'bg-rose-900/50 text-rose-300/50 scale-95' : 'bg-blue-600/50 text-white/50 scale-95') : (isLoveMode ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:scale-105' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20')}`}
          >
            {isLoveMode && input.trim() ? <Heart size={20} fill="white" className="animate-pulse" /> : <Send size={20} className="ml-1" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}