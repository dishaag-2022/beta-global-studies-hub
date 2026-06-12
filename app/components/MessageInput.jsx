import React from 'react';
import { Send, Smile, Camera, Image as ImageIcon } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({
  input,
  setInput,
  handleTextSubmit,
  handleInputChange,
  isUploading,
  showEmojis,
  setShowEmojis,
  cameraInputRef,
  galleryInputRef,
  isDarkMode,
  ignorePanicRef,
  scrollToBottom
}) {
  return (
    <>
      {/* Emoji Picker Popup */}
      {showEmojis && (
        <div className={`absolute bottom-[85px] left-2 sm:left-4 z-50 shadow-xl opacity-100 rounded-3xl overflow-hidden ${isDarkMode ? "bg-[#18181b] border border-[#27272a]" : "bg-white"}`}>
          <EmojiPicker 
            onEmojiClick={(emoji) => setInput(p => p + emoji.emoji)} 
            theme={isDarkMode ? "dark" : "light"} 
            width={280} 
            height={320} 
            previewConfig={{ showPreview: false }} 
          />
        </div>
      )}

      {/* Bottom Text Bar */}
      <div 
        className={`w-full p-3 z-20 shrink-0 border-t transition-colors duration-300 ${isDarkMode ? "bg-[#09090b] border-[#27272a]" : "bg-[#f4f5f9] border-slate-200"}`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-full mx-auto flex gap-2 items-center relative z-20">
          
          {/* Input Box Area */}
          <div className={`flex-1 flex items-center rounded-full px-3 py-1 border focus-within:border-blue-500 transition-colors shadow-sm relative z-20 h-[48px] ${isDarkMode ? "bg-[#18181b] border-[#3f3f46]" : "bg-white border-slate-200"}`}>
            
            {/* Emoji Toggle Button */}
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} className={`p-1 transition-colors ${isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
              <Smile size={22} strokeWidth={1.5} />
            </button>
            
            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center h-full px-2">
              <input 
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

            {/* Camera & Gallery Buttons */}
            <div className="flex gap-1.5 items-center shrink-0">
              <button type="button" disabled={isUploading} onClick={(e) => { e.preventDefault(); ignorePanicRef.current = true; cameraInputRef.current?.click(); }} className={`p-1 disabled:opacity-50 transition-colors ${isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <Camera size={22} strokeWidth={1.5} />
              </button>
              <button type="button" disabled={isUploading} onClick={(e) => { e.preventDefault(); ignorePanicRef.current = true; galleryInputRef.current?.click(); }} className={`p-1 disabled:opacity-50 transition-colors ${isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                <ImageIcon size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button 
            onClick={handleTextSubmit} 
            disabled={!input.trim() || isUploading} 
            className="w-[48px] h-[48px] shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:scale-95 transition-transform shadow-sm shadow-blue-600/20 relative z-20 will-change-transform"
          >
            <Send size={20} className="ml-1" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  );
}