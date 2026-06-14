import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Play } from 'lucide-react';

const FloatingHearts = () => {
  const [hearts, setHearts] = useState([]);
  useEffect(() => {
    setHearts(Array.from({ length: 15 }).map(() => ({
      id: Math.random(),
      size: Math.random() * 15 + 10,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 6,
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 1; }
          100% { transform: translateY(-120vh) scale(1.2); opacity: 0; }
        }
        .css-heart { 
          position: absolute; 
          top: 100%;
          opacity: 0;
          animation: floatUp linear infinite; 
        }
      `}</style>
      {hearts.map((h) => (
        <div
          key={h.id}
          className="css-heart drop-shadow-md"
          style={{ left: `${h.left}%`, fontSize: `${h.size}px`, animationDuration: `${h.duration}s`, animationDelay: `${h.delay}s` }}
        >
          {Math.random() > 0.5 ? "❤️" : "💖"}
        </div>
      ))}
    </div>
  );
};

const SendBurst = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [1, 2.5], opacity: [1, 0] }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 text-4xl drop-shadow-lg"
    >
      💖
    </motion.div>
  );
};

const MessageBubble = ({ 
  msg, isMe, showAvatar, isDarkMode, isLoveMode, 
  setExpandedImage, setReplyTo, handleReaction,
  activeReactionMsg, setActiveReactionMsg 
}) => {
  const pressTimer = useRef(null);

  const startPress = () => {
    pressTimer.current = setTimeout(() => {
      setActiveReactionMsg(msg.id || msg._id);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 400); 
  };

  const cancelPress = () => {
    clearTimeout(pressTimer.current);
  };

  let content = msg.text;
  let isReply = false;
  let originalText = "";
  
  if (content.startsWith("RPL_SYS|||")) {
     const parts = content.split("|||");
     originalText = parts[1];
     content = parts[2];
     isReply = true;
  }

  const isImage = content.startsWith("IMG_SYS::");
  const isVideo = content.startsWith("VID_SYS::");
  const isSticker = content.startsWith("STK_SYS::"); 
  const isMedia = isImage || isVideo || isSticker;
  
  const parts = isMedia ? content.split("::") : [];
  let mediaUrl = isMedia ? parts[1] : null;

  if (isVideo && mediaUrl && mediaUrl.includes('/upload/')) mediaUrl = mediaUrl.replace('/upload/', '/upload/f_mp4,vc_auto,q_auto/');
  
  const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/i;
  const igMatch = !isMedia ? content.match(igRegex) : null;
  const igEmbedUrl = igMatch ? `https://www.instagram.com/p/${igMatch[1]}/embed` : null;

  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = !isMedia ? content.match(ytRegex) : null;
  const ytEmbedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;

  const isNewMessage = Date.now() - msg.id < 2000; 

  const myBubbleStyle = isLoveMode 
    ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm"
    : "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-sm";
    
  const theirBubbleStyle = isLoveMode
    ? (isDarkMode ? "bg-[#2e1018] border border-rose-900/50 text-rose-100 shadow-sm" : "bg-[#fff0f5] border border-rose-200 text-rose-900 shadow-sm")
    : (isDarkMode ? "bg-[#27272a] text-slate-200 border border-[#3f3f46] shadow-sm" : "bg-white text-slate-800 border-slate-200 shadow-sm border");

  let myReaction = msg.reactions?.me;
  let theirReaction = msg.reactions?.them;

  if (!msg.reactions && msg.reaction) {
     theirReaction = msg.reaction; 
  }

  const reactionCounts = {};
  if (myReaction) reactionCounts[myReaction] = (reactionCounts[myReaction] || 0) + 1;
  if (theirReaction) reactionCounts[theirReaction] = (reactionCounts[theirReaction] || 0) + 1;
  const uniqueEmojis = Object.keys(reactionCounts);

  return (
    <motion.div layout className={`flex w-full relative z-10 ${isMe ? 'justify-end' : 'justify-start'}`}>
      
      {showAvatar && (
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 mr-2 mt-auto mb-1 flex-shrink-0 overflow-hidden border border-slate-300 dark:border-slate-600 shadow-sm z-10">
          <img src={isLoveMode ? "/love.png" : "/cat.png"} alt="avatar" className="w-full h-full object-cover" />
        </div>
      )}
      {!showAvatar && !isMe && <div className="w-9 flex-shrink-0"></div>}

      <div className={`relative group max-w-[85%] sm:max-w-[75%] flex flex-col min-w-0 overflow-visible ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* REACTION EMOJI MENU */}
        <AnimatePresence>
          {activeReactionMsg === (msg.id || msg._id) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute ${isMe ? "right-0" : "left-0"} -top-[52px] rounded-full px-3 py-2 flex gap-3 z-[60] shadow-xl border
                ${isLoveMode ? "bg-[#2e1018] border-rose-500/40 shadow-rose-500/20" : 
                  isDarkMode ? "bg-[#27272a] border-[#3f3f46] shadow-black/50" : "bg-white border-slate-200 shadow-slate-200"}
              `}
            >
              {['❤️','😂','😮','😢','😡','👍'].map(emoji => (
                 <button 
                   key={emoji} 
                   className={`text-xl transition-transform hover:scale-125 hover:-translate-y-1 ${myReaction === emoji ? 'bg-black/20 dark:bg-white/20 rounded-full scale-110' : ''}`} 
                   onClick={(e) => {
                     e.stopPropagation(); 
                     handleReaction(msg.id || msg._id, myReaction === emoji ? "" : emoji);
                     setActiveReactionMsg(null);
                   }}
                 >
                     {emoji}
                 </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-fit max-w-full flex flex-col min-w-0">
          <motion.div
            layout 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(e, info) => {
              if (info.offset.x > 50 || info.offset.x < -50) {
                setReplyTo(msg);
                if (navigator.vibrate) navigator.vibrate(50);
              }
            }}
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => { 
               e.preventDefault(); 
               setActiveReactionMsg(msg.id || msg._id); 
            }} 
            onDoubleClick={(e) => { 
              e.stopPropagation(); 
              handleReaction(msg.id || msg._id, myReaction === '❤️' ? "" : '❤️'); 
              if (navigator.vibrate) navigator.vibrate(50);
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`relative px-4 py-2 shadow-sm cursor-pointer select-none flex flex-col text-left text-[15px] leading-snug w-fit max-w-full break-words min-w-0
              ${isSticker ? "bg-transparent shadow-none p-0" : 
                 (isMe 
                    ? `${myBubbleStyle} rounded-2xl rounded-tr-sm`
                    : `${theirBubbleStyle} rounded-2xl rounded-tl-sm`
                 )}
            `}
          >
            {isMe && isLoveMode && isNewMessage && <SendBurst />}

            {isReply && (
               <div className={`mb-1 mt-0.5 p-1.5 rounded-lg border-l-4 text-[12px] leading-tight flex flex-col min-w-0 w-full
                  ${isMe ? "bg-black/15 border-white/60 text-white/95" : 
                           isLoveMode ? "bg-black/10 border-rose-400 text-rose-800 dark:text-rose-200" :
                           isDarkMode ? "bg-white/5 border-indigo-400 text-slate-300" : 
                                        "bg-black/5 border-indigo-500 text-slate-600"}`}>
                  <span className="font-bold mb-0.5 opacity-80 text-[10px]">{isMe ? "You" : "Partner"}</span>
                  <span className="line-clamp-3 text-ellipsis overflow-hidden whitespace-normal break-words min-w-0 w-full">
                     {originalText.startsWith("IMG_SYS") ? "📷 Photo" : originalText.startsWith("VID_SYS") ? "🎥 Video" : originalText.startsWith("STK_SYS") ? "✨ Sticker" : originalText.split("|||").pop()}
                  </span>
               </div>
            )}
            
            {isSticker ? (
                <img src={mediaUrl} alt="Sticker" className={`relative z-10 w-32 h-32 object-contain pointer-events-none drop-shadow-lg ${isLoveMode ? 'filter saturate-150 contrast-110' : ''}`} />
            ) : isImage ? (
               <img src={mediaUrl} alt="Photo" onClick={(e) => { e.stopPropagation(); setExpandedImage({ url: mediaUrl, type: 'image' }); }} className={`relative z-10 max-w-[220px] sm:max-w-[260px] rounded-lg cursor-pointer active:opacity-80 transition-opacity mt-0.5 ${isLoveMode ? 'shadow-sm' : ''}`} />
            ) : isVideo ? (
               <div className="relative z-10 cursor-pointer group rounded-lg overflow-hidden mt-0.5" onClick={(e) => { e.stopPropagation(); setExpandedImage({ url: mediaUrl, type: 'video' }); }}>
                 <video src={mediaUrl} preload="auto" className="min-h-[180px] w-[220px] bg-black/20 object-cover pointer-events-none" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all"><Play className="text-white w-10 h-10 shadow-sm" /></div>
               </div>
            ) : (
               <div className="relative z-10 flex flex-col">
                 <span className={`whitespace-pre-wrap break-words ${isLoveMode && !isMe ? "drop-shadow-[0_0_2px_rgba(255,200,200,0.3)]" : ""}`}>
                   {content}
                 </span>
                 
                 {igEmbedUrl && (
                   <div className={`mt-2 w-[240px] sm:w-[300px] h-[400px] rounded-xl overflow-hidden border ${isLoveMode ? "bg-[#2e1018] border-rose-900/50" : isDarkMode ? "bg-black border-[#3f3f46]" : "bg-white border-slate-200"}`}>
                      <iframe src={igEmbedUrl} className="w-full h-full border-none" scrolling="no" allowTransparency="true"></iframe>
                   </div>
                 )}
                 {ytEmbedUrl && (
                   <div className={`mt-2 w-[240px] sm:w-[300px] aspect-video rounded-xl overflow-hidden border shadow-sm ${isLoveMode ? "bg-[#2e1018] border-rose-900/50" : isDarkMode ? "bg-black border-[#3f3f46]" : "bg-white border-slate-200"}`}>
                      <iframe src={ytEmbedUrl} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                   </div>
                 )}
               </div>
            )}
          </motion.div>

          <AnimatePresence>
            {uniqueEmojis.length > 0 && (
              <motion.div 
                layout
                initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                className={`absolute -bottom-3 ${isMe ? "left-0 -ml-2" : "right-0 -mr-2"} flex items-center gap-0.5 p-0.5 px-1.5 rounded-full shadow-sm z-30 border
                  ${isLoveMode ? "bg-[#3f0f1f] border-rose-500/40" : 
                    isDarkMode ? "bg-[#27272a] border-[#3f3f46]" : "bg-white border-slate-200"}`}
              >
                 {uniqueEmojis.map(emoji => {
                   const count = reactionCounts[emoji];
                   const didIReactWithThis = myReaction === emoji;
                   return (
                     <button
                       key={emoji}
                       onClick={(e) => {
                         e.stopPropagation();
                         handleReaction(msg.id || msg._id, didIReactWithThis ? "" : emoji);
                         if (navigator.vibrate) navigator.vibrate(30);
                       }}
                       className={`flex items-center justify-center rounded-full px-1 py-0.5 transition-transform hover:scale-110 active:scale-90 ${didIReactWithThis ? "bg-black/10 dark:bg-white/10" : ""}`}
                     >
                       <span className="text-[12px] leading-none drop-shadow-sm">{emoji}</span>
                       {count > 1 && <span className={`text-[10px] leading-none ml-1 font-bold ${isLoveMode ? 'text-rose-300' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{count}</span>}
                     </button>
                   )
                 })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isSticker && (
          <div className={`flex items-center gap-1 mt-1 text-[10.5px] font-medium tracking-wide
            ${isLoveMode ? "text-rose-300/80" : isDarkMode ? "text-slate-400" : "text-slate-500"} 
          `}>
            <span>{msg.time}</span>
            {isMe && (
               <CheckCheck size={14} strokeWidth={2.5} className={msg.seenAt ? (isLoveMode ? "text-pink-400" : "text-blue-500 dark:text-blue-400") : (isLoveMode ? "text-rose-300/80" : "text-slate-400 dark:text-slate-500")} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function MessageList({
  messages, isDarkMode, isLoveMode, expandedImage, setExpandedImage,
  isPeerActive, isPeerTyping, chatContainerRef, bgPatternDark, bgPatternLight, bgPatternLove,
  setReplyTo, handleReaction
}) {
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const currentBgPattern = isLoveMode ? bgPatternLove : (isDarkMode ? bgPatternDark : bgPatternLight);

  // 🔥 FIX 2: AUTOMATIC SCROLL WATCHER
  // Jab bhi naya message aayega, chat automatically neeche ghisak jayegi
  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
    }
  }, [messages, chatContainerRef]);

  return (
    <div className="relative flex-1 w-full overflow-hidden flex flex-col">
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-3.5 z-10 scrollbar-hide relative will-change-scroll w-full scroll-smooth transition-colors duration-500"
        style={{ backgroundImage: currentBgPattern, backgroundSize: "180px 180px", backgroundColor: "transparent" }}
        onClick={() => setActiveReactionMsg(null)} 
      >
        
        {isLoveMode && <FloatingHearts />}

        <div className="h-14 w-full shrink-0"></div>

        <AnimatePresence>
          {messages.map((msg, index) => {
            const isMe = msg.sender === "me";
            const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.sender === "me");
            
            return (
              <MessageBubble 
                key={msg.id || msg._id || index}
                msg={msg} 
                isMe={isMe} 
                showAvatar={showAvatar} 
                isDarkMode={isDarkMode} 
                isLoveMode={isLoveMode}
                setExpandedImage={setExpandedImage}
                setReplyTo={setReplyTo}
                handleReaction={handleReaction}
                activeReactionMsg={activeReactionMsg}
                setActiveReactionMsg={setActiveReactionMsg}
              />
            );
          })}
        </AnimatePresence>
        
        {/* 🔥 FIX 3: INCREASED BOTTOM PADDING
            Ab aakhiri message input box se chipkega nahi, safe distance pe rahega */}
        <div className="h-12 w-full shrink-0" /> 
      </div>

      <AnimatePresence>
        {expandedImage && (
           <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setExpandedImage(null)} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
              {expandedImage.type === 'video' ? (
                 <video src={expandedImage.url} controls autoPlay className="max-w-full max-h-full rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
              ) : (
                 <img src={expandedImage.url} alt="Expanded" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
              )}
           </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-[10px] left-4 z-20 pointer-events-none flex flex-col items-center">
        <AnimatePresence>
          {isPeerTyping && (
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="relative flex flex-col items-start z-10">
               <div className={`shadow-sm rounded-full px-4 py-2 flex items-center justify-center z-20 border transition-colors duration-300 ${isLoveMode ? "bg-[#2e1018]/90 backdrop-blur-sm border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]" : isDarkMode ? "bg-[#27272a] border-[#3f3f46]" : "bg-white border-slate-100"}`}>
                 <span className={`flex gap-1 font-black text-xl leading-none pb-1 ${isLoveMode ? "text-pink-400 drop-shadow-[0_0_5px_rgba(244,114,182,0.6)]" : "text-indigo-500"}`}>
                   <span className="animate-bounce">.</span>
                   <span className="animate-bounce" style={{animationDelay: '120ms'}}>.</span>
                   <span className="animate-bounce" style={{animationDelay: '240ms'}}>.</span>
                 </span>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}