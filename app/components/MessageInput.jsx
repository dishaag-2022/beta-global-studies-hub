import React, { useState, useEffect } from 'react';
import { Send, Smile, Camera, Image as ImageIcon, Sticker, Search } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({
  inputRef, // 🔥 THE FIX: inputRef added here
  input, setInput, handleTextSubmit, handleInputChange, isUploading,
  showEmojis, setShowEmojis, cameraInputRef, galleryInputRef, isDarkMode, 
  ignorePanicRef, scrollToBottom, dispatchMessage 
}) {
  const [showStickers, setShowStickers] = useState(false);
  
  // 🔥 GIPHY STATES
  const [gifs, setGifs] = useState([]);
  const [stickerSearch, setStickerSearch] = useState("");
  const [loadingGifs, setLoadingGifs] = useState(false);

  // GIPHY API FETCH LOGIC
  const fetchGifs = async (query) => {
    setLoadingGifs(true);
    const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

    const endpoint = query.trim()
      ? `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=30`
      : `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=30`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.data || []);
    } catch(e) {
      console.error("Giphy Fetch Error:", e);
    }
    setLoadingGifs(false);
  };

  // Fetch trending on open, and handle search with a slight debounce
  useEffect(() => {
    if (!showStickers) return;
    
    const delayDebounceFn = setTimeout(() => {
      fetchGifs(stickerSearch);
    }, 500); // 500ms delay to prevent spamming API on every keystroke

    return () => clearTimeout(delayDebounceFn);
  }, [stickerSearch, showStickers]);

  // One-Tap Sticker Send Logic
  const handleStickerSend = (url) => {
    if(dispatchMessage) {
      dispatchMessage(`STK_SYS::${url}`);
      setShowStickers(false);
      setStickerSearch(""); // Reset search after sending
      setTimeout(scrollToBottom, 100);
    } else {
      alert("Error: dispatchMessage prop not connected in page.js");
    }
  };

  const toggleEmojis = () => { setShowEmojis(!showEmojis); setShowStickers(false); };
  const toggleStickers = () => { setShowStickers(!showStickers); setShowEmojis(false); };

  return (
    <>
      {/* Emoji Picker Popup */}
      {showEmojis && (
        <div className={`absolute bottom-[85px] left-2 sm:left-4 z-50 shadow-xl opacity-100 rounded-3xl overflow-hidden ${isDarkMode ? "bg-[#18181b] border border-[#27272a]" : "bg-white"}`}>
          <EmojiPicker onEmojiClick={(emoji) => setInput(p => p + emoji.emoji)} theme={isDarkMode ? "dark" : "light"} width={280} height={320} previewConfig={{ showPreview: false }} />
        </div>
      )}

      {/* 🔥 NEW: Giphy Search & Picker Panel */}
      {showStickers && (
        <div className={`absolute bottom-[85px] left-2 sm:left-4 z-50 shadow-2xl rounded-3xl p-3 w-[300px] h-[360px] flex flex-col transition-colors ${isDarkMode ? "bg-[#18181b] border border-[#27272a]" : "bg-white border border-slate-200"}`}>
          
          {/* Search Bar */}
          <div className={`flex items-center px-3 py-2 mb-3 rounded-xl border ${isDarkMode ? "bg-[#09090b] border-[#3f3f46]" : "bg-slate-50 border-slate-200"}`}>
            <Search size={16} className={isDarkMode ? "text-slate-400" : "text-slate-500"} />
            <input 
              type="text" 
              placeholder="Search Memes..." 
              value={stickerSearch}
              onChange={(e) => setStickerSearch(e.target.value)}
              className={`w-full ml-2 bg-transparent outline-none text-sm ${isDarkMode ? "text-slate-200 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
            />
          </div>

          {/* GIF Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 scrollbar-hide pr-1">
            {loadingGifs ? (
              <div className="col-span-3 flex items-center justify-center h-full text-sm font-medium text-slate-500 animate-pulse">
                Loading Memes...
              </div>
            ) : gifs.length > 0 ? (
              gifs.map((gif) => (
                <div 
                  key={gif.id} 
                  onClick={() => handleStickerSend(gif.images.fixed_height.url)} 
                  className={`cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-1 rounded-xl h-20 ${isDarkMode ? "hover:bg-[#27272a]" : "hover:bg-slate-100"}`}
                >
                  <img 
                    src={gif.images.fixed_height_small.url} 
                    alt={gif.title} 
                    className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md" 
                  />
                </div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center h-full text-sm text-slate-500">
                No stickers found
              </div>
            )}
          </div>
          
          {/* Giphy Attribution (Required by their API terms) */}
          <div className="text-[10px] text-center mt-2 opacity-50 font-bold tracking-widest uppercase">
            Powered by GIPHY
          </div>
        </div>
      )}

      {/* Bottom Text Bar */}
      <div className={`w-full p-3 z-20 shrink-0 border-t transition-colors duration-300 ${isDarkMode ? "bg-[#09090b] border-[#27272a]" : "bg-[#f4f5f9] border-slate-200"}`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-full mx-auto flex gap-2 items-center relative z-20">
          
          <div className={`flex-1 flex items-center rounded-full px-2 py-1 border focus-within:border-blue-500 transition-colors shadow-sm relative z-20 h-[48px] ${isDarkMode ? "bg-[#18181b] border-[#3f3f46]" : "bg-white border-slate-200"}`}>
            
            {/* Emoji & Sticker Toggles */}
            <div className="flex items-center">
              <button type="button" onClick={toggleEmojis} className={`p-1.5 transition-colors ${showEmojis ? "text-blue-500" : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Smile size={22} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={toggleStickers} className={`p-1.5 transition-colors ${showStickers ? "text-blue-500" : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Sticker size={22} strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center h-full px-1">
              <input 
                ref={inputRef} // 🔥 THE FIX: React ref bound to input
                type="text" 
                value={input} 
                onChange={handleInputChange} 
                onFocus={() => setTimeout(scrollToBottom, 300)} 
                className={`flex-1 bg-transparent border-none text-[16px] outline-none h-full w-full ${isDarkMode ? "text-slate-200 placeholder-slate-500" : "text-slate-700 placeholder-slate-400"}`} 
                placeholder={isUploading ? "Sending photo..." : "Message..."} 
                autoComplete="off" 
                disabled={isUploading} 
              />
            </form>

            <div className="flex gap-0.5 items-center shrink-0 pr-1">
              <button type="button" disabled={isUploading} onClick={(e) => { e.preventDefault(); ignorePanicRef.current = true; cameraInputRef.current?.click(); }} className={`p-1.5 disabled:opacity-50 transition-colors ${isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Camera size={22} strokeWidth={1.5} />
              </button>
              <button type="button" disabled={isUploading} onClick={(e) => { e.preventDefault(); ignorePanicRef.current = true; galleryInputRef.current?.click(); }} className={`p-1.5 disabled:opacity-50 transition-colors ${isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <ImageIcon size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <button 
            onClick={handleTextSubmit} 
            onPointerDown={(e) => e.preventDefault()} // 🔥 THE FIX: Prevents losing focus from input box
            disabled={!input.trim() && !isUploading} 
            className={`w-[48px] h-[48px] shrink-0 flex items-center justify-center rounded-full transition-transform shadow-sm relative z-20 will-change-transform ${(!input.trim() && !isUploading) ? 'bg-blue-600/50 text-white/50 scale-95' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'}`}
          >
            <Send size={20} className="ml-1" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  );
}