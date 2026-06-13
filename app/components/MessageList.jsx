import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, X, Play } from "lucide-react";

export default function MessageList({
  messages, isDarkMode, expandedImage, setExpandedImage, isPeerActive, isPeerTyping, chatContainerRef, bgPatternDark, bgPatternLight
}) {
  return (
    <>
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-hide relative will-change-scroll w-full scroll-smooth"
        style={{ backgroundImage: isDarkMode ? bgPatternDark : bgPatternLight, backgroundSize: "180px 180px" }}
      >
        <AnimatePresence>
          {messages.map((m) => {
            // 🔥 YAHAN HAI ASLI JADUU: Sticker ko identify karne ka code
            const isImage = m.text.startsWith("IMG_SYS::");
            const isVideo = m.text.startsWith("VID_SYS::");
            const isSticker = m.text.startsWith("STK_SYS::"); 
            const isMedia = isImage || isVideo || isSticker;
            
            const parts = isMedia ? m.text.split("::") : [];
            let mediaUrl = isMedia ? parts[1] : null;

            if (isVideo && mediaUrl && mediaUrl.includes('/upload/')) {
              mediaUrl = mediaUrl.replace('/upload/', '/upload/f_mp4,vc_auto,q_auto/');
            }

            const isMe = m.sender === "me";

            return (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} will-change-transform`}
              >
                <div className={`relative max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                  
                  {/* 🔥 STICKER CHECK: Agar sticker hai toh Bubble/Dabba mat lagao */}
                  <div className={
                    isSticker 
                      ? "py-1" 
                      : `px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words ${isMe ? "bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-2xl rounded-tr-sm shadow-md" : isDarkMode ? "bg-[#27272a] text-slate-200 rounded-2xl rounded-tl-sm border border-[#3f3f46]" : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100"}`
                  }>
                    
                    {isSticker ? (
                       <img src={mediaUrl} alt="Sticker" className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-xl pointer-events-none" />
                    ) : isImage ? (
                      <img src={mediaUrl} alt="Photo" onClick={() => setExpandedImage({ url: mediaUrl, type: 'image' })} className="max-w-[200px] sm:max-w-[250px] rounded-lg cursor-pointer active:opacity-80 transition-opacity" />
                    ) : isVideo ? (
                      <div className="relative cursor-pointer group" onClick={() => setExpandedImage({ url: mediaUrl, type: 'video' })}>
                        <video src={mediaUrl} preload="auto" className="min-h-[180px] w-[220px] sm:w-[260px] bg-black/20 rounded-lg shadow-sm object-cover pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10 group-hover:bg-black/30 transition-all">
                          <div className="w-14 h-14 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20"><Play className="text-white fill-white w-6 h-6 ml-1" /></div>
                        </div>
                      </div>
                    ) : (
                      <span>{m.text}</span>
                    )}

                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{m.time}</span>
                    {isMe && ( !m.seenAt ? <CheckCheck size={14} className="text-slate-500" /> : <CheckCheck size={14} className="text-blue-500" /> )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div className="h-8 w-full shrink-0" />
      </div>

      {/* 2. Fullscreen Media Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 will-change-transform" onClick={() => setExpandedImage(null)}>
            <div className="absolute top-8 right-4 flex items-center gap-3 z-[9999]" onClick={(e) => e.stopPropagation()}><button className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition shadow-lg border border-white/10" onClick={() => setExpandedImage(null)}><X size={22} /></button></div>
            {(() => {
              const modalUrl = typeof expandedImage === 'string' ? expandedImage : expandedImage.url;
              const isModalVideo = expandedImage?.type === 'video' || (typeof expandedImage === 'string' && expandedImage.includes('/video/'));
              return isModalVideo ? (
                <motion.video initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} src={modalUrl} controls autoPlay playsInline className="max-w-full max-h-full rounded-2xl shadow-2xl will-change-transform outline-none" onClick={(e) => e.stopPropagation()} />
              ) : (
                <motion.img initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} src={modalUrl} alt="Photo View" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl will-change-transform pointer-events-none select-none" />
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Peer Active & Typing Indicator */}
      <div className="absolute bottom-[72px] left-4 z-10 pointer-events-none flex flex-col items-center">
        <AnimatePresence>
          {isPeerActive && (
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="relative flex flex-col items-center will-change-transform">
              {isPeerTyping && (
                <motion.div initial={{ scale: 0, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: -5 }} exit={{ scale: 0, opacity: 0 }} className={`absolute -top-10 shadow-sm rounded-2xl rounded-bl-sm px-3 py-1.5 flex items-center justify-center z-20 border ${isDarkMode ? "bg-[#27272a] border-[#3f3f46]" : "bg-white border-slate-100"}`}><span className="flex gap-0.5 text-indigo-500 font-bold text-lg leading-none pb-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '100ms'}}>.</span><span className="animate-bounce" style={{animationDelay: '200ms'}}>.</span></span></motion.div>
              )}
              <div className="relative w-12 h-10 overflow-visible"><div className="absolute -left-0.5 bottom-0 w-[14px] h-[10px] bg-gradient-to-b from-[#ffb74d] to-[#f57c00] rounded-[8px] shadow-sm transform -rotate-[15deg] z-20"></div><div className="absolute -right-0.5 bottom-0 w-[14px] h-[10px] bg-gradient-to-b from-[#ffb74d] to-[#f57c00] rounded-[8px] shadow-sm transform rotate-[15deg] z-20"></div><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png" alt="Cute 3D Cat" className="w-12 h-12 absolute bottom-[2px] left-0 z-10" /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}