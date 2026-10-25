import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Play, Pin, Trash2, XCircle, X, Clock } from 'lucide-react';

const FloatingHearts = () => {
  const [hearts, setHearts] = useState([]);
  useEffect(() => { setHearts(Array.from({ length: 15 }).map(() => ({ id: Math.random(), size: Math.random() * 15 + 10, left: Math.random() * 100, delay: Math.random() * 5, duration: Math.random() * 6 + 6 }))); }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <style>{`@keyframes floatUp { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 20% { opacity: 0.8; } 80% { opacity: 1; } 100% { transform: translateY(-120vh) scale(1.2); opacity: 0; } } .css-heart { position: absolute; top: 100%; opacity: 0; animation: floatUp linear infinite; }`}</style>
      {hearts.map((h) => <div key={h.id} className="css-heart drop-shadow-md" style={{ left: `${h.left}%`, fontSize: `${h.size}px`, animationDuration: `${h.duration}s`, animationDelay: `${h.delay}s` }}>{Math.random() > 0.5 ? "❤️" : "💖"}</div>)}
    </div>
  );
};

const SendBurst = () => <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: [1, 2.5], opacity: [1, 0] }} transition={{ duration: 0.6, ease: "easeOut" }} className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 text-4xl drop-shadow-lg">💖</motion.div>;

const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const formatDateLabel = (timestamp) => {
    if (!timestamp) return "Today";
    const date = new Date(timestamp); const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, today)) return "Today"; if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MessageBubble = ({ 
  msg, isMe, showAvatar, isDarkMode, isLoveMode, setExpandedImage, setReplyTo, handleReaction, handleMessageAction,
  activeReactionMsg, setActiveReactionMsg, setPinModalMsg, highlightedMsgId
}) => {
  const pressTimer = useRef(null);
  const msgKey = String(msg._id || msg.id);

  const startPress = () => { if (msg.isDeleted) return; pressTimer.current = setTimeout(() => { setActiveReactionMsg(msgKey); if (navigator.vibrate) navigator.vibrate(50); }, 400); };
  const cancelPress = () => clearTimeout(pressTimer.current);

  let content = msg.isDeleted ? "🚫 This message was deleted" : (msg.text || "");
  let isReply = false; let originalText = "";
  if (!msg.isDeleted && content.includes("RPL_SYS|||")) { const parts = content.split("|||"); content = parts.pop() || ""; originalText = parts.pop() || ""; isReply = true; }

  const isImage = !msg.isDeleted && content.startsWith("IMG_SYS::");
  const isVideo = !msg.isDeleted && content.startsWith("VID_SYS::");
  const isSticker = !msg.isDeleted && content.startsWith("STK_SYS::"); 
  const isAudio = !msg.isDeleted && content.startsWith("AUD_SYS::");
  const isMedia = isImage || isVideo || isSticker || isAudio;
  
  let mediaUrl = isMedia ? content.split("::")[1] : null;

  // 🔥 FAST CLOUDINARY LOAD (Auto compress & format)
  if (mediaUrl && mediaUrl.includes('/upload/')) {
      if (isVideo) mediaUrl = mediaUrl.replace('/upload/', '/upload/f_mp4,vc_auto,q_auto,w_400/');
      else if (isImage) mediaUrl = mediaUrl.replace('/upload/', '/upload/q_auto,f_auto,w_500/');
  }
  
  const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/i;
  const igMatch = !isMedia && !msg.isDeleted ? content.match(igRegex) : null;
  const igEmbedUrl = igMatch ? `https://www.instagram.com/p/${igMatch[1]}/embed` : null;
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = !isMedia && !msg.isDeleted ? content.match(ytRegex) : null;
  const ytEmbedUrl = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;

  const isNewMessage = Date.now() - Number(msg.id) < 2000; 
  const isHighlighted = highlightedMsgId === msgKey;

  const getBubbleStyle = () => {
    if (isSticker) return { background: "transparent", border: "none", boxShadow: "none", padding: 0 };
    if (isMe) return { backgroundColor: isLoveMode ? "#f43f5e" : "#3b82f6", color: "#ffffff", border: isHighlighted ? "2px solid #fbbf24" : (isLoveMode ? "1px solid #fb7185" : "1px solid #60a5fa"), boxShadow: isHighlighted ? "0 0 20px rgba(251, 191, 36, 0.6)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" };
    else return { backgroundColor: isLoveMode ? "#fdf2f8" : (isDarkMode ? "#27272a" : "#ffffff"), color: isLoveMode ? "#881337" : (isDarkMode ? "#f8fafc" : "#1e293b"), border: isHighlighted ? "2px solid #fbbf24" : (isLoveMode ? "1px solid #fbcfe8" : (isDarkMode ? "1px solid #3f3f46" : "1px solid #e2e8f0")), boxShadow: isHighlighted ? "0 0 20px rgba(251, 191, 36, 0.6)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" };
  };

  return (
    <motion.div id={`msg-${msgKey}`} layout className={`flex w-full relative z-10 transition-transform duration-300 ${isMe ? 'justify-end' : 'justify-start'} ${msg.isDeleted ? 'opacity-75 italic' : ''} ${isHighlighted ? 'scale-[1.03]' : ''}`}>
      {showAvatar && <div className="w-7 h-7 rounded-full bg-slate-200 mr-2 mt-auto mb-1 flex-shrink-0 overflow-hidden border border-slate-300 shadow-sm z-10"><img src={isLoveMode ? "/love.png" : "/cat.png"} alt="avatar" className="w-full h-full object-cover" /></div>}
      {!showAvatar && !isMe && <div className="w-9 flex-shrink-0"></div>}

      <div className={`relative group max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <AnimatePresence>
          {activeReactionMsg === msgKey && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={(e) => e.stopPropagation()} className={`absolute ${isMe ? "right-0" : "left-0"} -top-[98px] rounded-2xl p-2.5 flex flex-col gap-2 z-[70] shadow-2xl border min-w-[210px]`} style={isLoveMode ? { backgroundColor: "#2e1018", borderColor: "rgba(244,63,94,0.4)" } : (isDarkMode ? { backgroundColor: "#27272a", borderColor: "#3f3f46" } : { backgroundColor: "#ffffff", borderColor: "#e2e8f0" })}>
              <div className="flex justify-between gap-2 px-1 border-b border-white/10 pb-2">
                {['❤️','😂','😮','😢','😡','👍'].map(emoji => <button key={emoji} className={`text-xl transition-transform hover:scale-125 hover:-translate-y-1 ${msg.reactions?.me === emoji ? 'bg-black/20 rounded-full scale-110' : ''}`} onClick={(e) => { e.stopPropagation(); handleReaction(msg._id || msg.id, msg.reactions?.me === emoji ? "" : emoji); setActiveReactionMsg(null); }}>{emoji}</button>)}
              </div>
              <div className="flex justify-around items-center gap-3 px-1 pt-0.5 text-xs font-bold">
                  <button onClick={(e) => { e.stopPropagation(); if (msg.isPinned) { handleMessageAction(msg._id || msg.id, "UNPIN"); } else { setPinModalMsg(msg); } setActiveReactionMsg(null); }} className={`flex items-center gap-1 hover:opacity-80 transition-opacity ${msg.isPinned ? 'text-amber-400' : 'text-sky-400'}`}><Pin size={14}/> {msg.isPinned ? "Unpin" : "Pin"}</button>
                  <button onClick={(e) => { e.stopPropagation(); handleMessageAction(msg._id || msg.id, "DELETE_ME"); setActiveReactionMsg(null); }} className="flex items-center gap-1 text-amber-400 hover:opacity-80 transition-opacity"><Trash2 size={14}/> Del (Me)</button>
                  {isMe && <button onClick={(e) => { e.stopPropagation(); handleMessageAction(msg._id || msg.id, "DELETE_EVERYONE"); setActiveReactionMsg(null); }} className="flex items-center gap-1 text-rose-500 hover:opacity-80 transition-opacity"><XCircle size={14}/> Del (All)</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-fit max-w-full flex flex-col">
          <motion.div
            layout drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={(e, info) => { if (info.offset.x > 50 || info.offset.x < -50) { setReplyTo(msg); if (navigator.vibrate) navigator.vibrate(50); } }} onPointerDown={startPress} onPointerUp={cancelPress} onPointerLeave={cancelPress}
            onContextMenu={(e) => { e.preventDefault(); if (!msg.isDeleted) setActiveReactionMsg(msgKey); }} onDoubleClick={(e) => { e.stopPropagation(); if (msg.isDeleted) return; handleReaction(msg._id || msg.id, msg.reactions?.me === '❤️' ? "" : '❤️'); if (navigator.vibrate) navigator.vibrate(50); }}
            onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} style={getBubbleStyle()}
            className={`relative px-4 py-2.5 cursor-pointer select-none flex flex-col text-left text-[15px] leading-snug w-fit max-w-full break-words ${isSticker ? '' : (isMe ? 'rounded-2xl rounded-br-[3px]' : 'rounded-2xl rounded-bl-[3px]')}`}
          >
            {msg.isPinned && <Pin size={13} className="absolute -top-1.5 -right-1.5 text-amber-400 fill-amber-400 bg-black rounded-full p-[2px] shadow-md z-20" />}
            {isMe && isLoveMode && isNewMessage && <SendBurst />}
            {isReply && (
               <div className="mb-1 mt-0.5 p-1.5 rounded-lg border-l-4 text-[12px] leading-tight flex flex-col w-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.1)", borderColor: isMe ? "rgba(255,255,255,0.6)" : (isLoveMode ? "#fb7185" : "#60a5fa"), color: "inherit" }}>
                  <span className="font-bold mb-0.5 opacity-80 text-[10px]">{isMe ? "You" : "Partner"}</span>
                  <span className="block w-full truncate opacity-90 overflow-hidden whitespace-nowrap text-ellipsis">{originalText.startsWith("IMG_SYS") ? "📷 Photo" : originalText.startsWith("VID_SYS") ? "🎥 Video" : originalText.startsWith("STK_SYS") ? "✨ Sticker" : originalText.startsWith("AUD_SYS") ? "🎤 Voice Message" : originalText}</span>
               </div>
            )}
            
            {isSticker ? ( <img src={mediaUrl} alt="Sticker" className={`relative z-10 w-32 h-32 object-contain pointer-events-none drop-shadow-lg ${isLoveMode ? 'filter saturate-150 contrast-110' : ''}`} />
            ) : isImage ? ( <img src={mediaUrl} alt="Photo" loading="lazy" onClick={(e) => { e.stopPropagation(); setExpandedImage({ url: mediaUrl.replace('q_auto,f_auto,w_500/', ''), type: 'image' }); }} className="relative z-10 max-w-[220px] sm:max-w-[260px] rounded-lg cursor-pointer active:opacity-80 transition-opacity mt-0.5" />
            ) : isVideo ? ( <div className="relative z-10 cursor-pointer group rounded-lg overflow-hidden mt-0.5" onClick={(e) => { e.stopPropagation(); setExpandedImage({ url: mediaUrl.replace('f_mp4,vc_auto,q_auto,w_400/', ''), type: 'video' }); }}><video src={mediaUrl} preload="auto" className="min-h-[180px] w-[220px] bg-black/20 object-cover pointer-events-none" /><div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all"><Play className="text-white w-10 h-10 shadow-sm" /></div></div>
            ) : isAudio ? ( <div className="flex items-center gap-3 py-1 px-2 min-w-[200px]"><audio controls src={mediaUrl} className="w-full h-10 outline-none rounded-full" /></div>
            ) : (
               <div className="relative z-10 flex flex-col max-w-full overflow-hidden">
                 <span className={`whitespace-pre-wrap break-words font-medium block w-full ${msg.isDeleted ? 'italic opacity-90' : ''}`}>{content}</span>
                 {igEmbedUrl && <div className="mt-2 w-full max-w-[240px] sm:max-w-[300px] h-[400px] rounded-xl overflow-hidden border bg-black border-[#3f3f46]"><iframe src={igEmbedUrl} className="w-full h-full border-none" scrolling="no" allowTransparency="true"></iframe></div>}
                 {ytEmbedUrl && <div className="mt-2 w-full max-w-[240px] sm:max-w-[300px] aspect-video rounded-xl overflow-hidden border shadow-sm bg-black border-[#3f3f46]"><iframe src={ytEmbedUrl} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>}
               </div>
            )}
          </motion.div>

          <AnimatePresence>
            {msg.reactions && (msg.reactions.me || msg.reactions.them) && (
              <motion.button layout initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} onClick={(e) => { e.stopPropagation(); handleReaction(msg._id || msg.id, ""); if (navigator.vibrate) navigator.vibrate(30); }} className={`absolute -bottom-3 ${isMe ? "left-0 -ml-2" : "right-0 -mr-2"} px-1.5 h-[24px] flex items-center justify-center rounded-full shadow-sm z-30 border transition-transform hover:scale-110 active:scale-90`} style={isLoveMode ? { backgroundColor: "#881337", borderColor: "#f43f5e", color: "#fff" } : (isDarkMode ? { backgroundColor: "#27272a", borderColor: "#3f3f46", color: "#fff" } : { backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#000" })}>
                 <span className="text-[12px] leading-none drop-shadow-sm flex gap-0.5">{msg.reactions.me && <span>{msg.reactions.me}</span>}{msg.reactions.them && msg.reactions.them !== msg.reactions.me && <span>{msg.reactions.them}</span>}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {!isSticker && (
          <div className="flex items-center gap-1 mt-1 text-[10.5px] font-bold tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] text-white/95"><span>{msg.time}</span>{isMe && <CheckCheck size={14} strokeWidth={2.5} className={msg.seenAt ? (isLoveMode ? "text-white" : "text-blue-300 drop-shadow-md") : "text-white/70"} />}</div>
        )}
      </div>
    </motion.div>
  );
};

export default function MessageList({
  messages, isDarkMode, isLoveMode, expandedImage, setExpandedImage,
  isPeerActive, isPeerTyping, chatContainerRef, setReplyTo, handleReaction, handleMessageAction
}) {
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const [pinModalMsg, setPinModalMsg] = useState(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const messagesEndRef = useRef(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    if (!chatContainerRef.current) return;
    if (!initialScrollDone.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      initialScrollDone.current = true;
    } 
    else if (initialScrollDone.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, chatContainerRef]);

  const activePinned = [...messages].reverse().find(m => m.isPinned && !m.isDeleted && (!m.pinnedUntil || new Date(m.pinnedUntil).getTime() > Date.now()));

  const currentBg = isLoveMode 
    ? "linear-gradient(rgba(46, 5, 20, 0.75), rgba(46, 5, 20, 0.75)), url('/dishaag.png')" 
    : (isDarkMode ? "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/dishaag.png')" : "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), url('/dishaag.png')");
  const currentSize = "cover";

  const getPinnedPreview = (text = "") => {
    let clean = text; if (clean.includes("RPL_SYS|||")) clean = clean.split("|||").pop() || "";
    if (clean.startsWith("IMG_SYS::")) return "📷 Photo"; if (clean.startsWith("VID_SYS::")) return "🎥 Video";
    if (clean.startsWith("STK_SYS::")) return "✨ Sticker"; if (clean.startsWith("AUD_SYS::")) return "🎤 Voice Message";
    return clean;
  };

  const formatRemainingPinTime = (pinnedUntil) => {
    if (!pinnedUntil) return "Pinned Forever"; const diff = new Date(pinnedUntil).getTime() - Date.now();
    if (diff <= 0) return "Expired"; const hours = Math.ceil(diff / (1000 * 60 * 60));
    if (hours > 24) return `${Math.ceil(hours / 24)}d left`; return `${hours}h left`;
  };

  const scrollToPinnedMessage = () => {
    if (!activePinned) return; const key = String(activePinned._id || activePinned.id); const el = document.getElementById(`msg-${key}`);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setHighlightedMsgId(key); setTimeout(() => setHighlightedMsgId(null), 2000); }
  };

  let lastDateLabel = null; 

  return (
    <div className="relative flex-1 w-full overflow-hidden flex flex-col" onClick={() => setActiveReactionMsg(null)}>
      <AnimatePresence>
        {activePinned && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full shrink-0 z-40 border-b shadow-lg backdrop-blur-xl cursor-pointer" style={isLoveMode ? { backgroundColor: "rgba(46, 5, 16, 0.95)", borderColor: "rgba(244, 63, 94, 0.4)" } : isDarkMode ? { backgroundColor: "rgba(24, 24, 27, 0.95)", borderColor: "#3f3f46" } : { backgroundColor: "rgba(255, 255, 255, 0.95)", borderColor: "#e2e8f0" }} onClick={scrollToPinnedMessage}>
            <div className="px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0"><Pin size={16} className="fill-amber-400" /></div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">Pinned Message</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 flex items-center gap-1"><Clock size={10} /> {formatRemainingPinTime(activePinned.pinnedUntil)}</span></div>
                  <span className="text-sm font-semibold truncate text-white/95 mt-0.5">{getPinnedPreview(activePinned.text)}</span>
                </div>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); handleMessageAction(activePinned._id || activePinned.id, "UNPIN"); }} className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/30 text-slate-200 hover:text-rose-300 transition-colors shrink-0"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-10 space-y-3.5 z-10 scrollbar-hide relative will-change-scroll w-full transition-colors duration-500" style={{ backgroundImage: currentBg, backgroundSize: currentSize, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "transparent" }}>
        {isLoveMode && <FloatingHearts />}
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isMe = msg.sender === "me"; const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.sender === "me");
            const currentDateLabel = formatDateLabel(msg.timestamp || msg.id); const showDivider = currentDateLabel !== lastDateLabel; lastDateLabel = currentDateLabel;
            return (
              <React.Fragment key={msg._id || msg.id || index}>
                {showDivider && (
                    <div className="flex justify-center my-5 w-full z-10"><span className={`px-4 py-1.5 rounded-xl text-[10.5px] font-extrabold uppercase tracking-widest shadow-sm backdrop-blur-md ${isLoveMode ? "bg-[#2e0510]/80 text-rose-300 border border-rose-500/30" : (isDarkMode ? "bg-zinc-800/80 text-slate-300 border border-zinc-700" : "bg-white/80 text-slate-600 border border-slate-200")}`}>{currentDateLabel}</span></div>
                )}
                <MessageBubble msg={msg} isMe={isMe} showAvatar={showAvatar} isDarkMode={isDarkMode} isLoveMode={isLoveMode} setExpandedImage={setExpandedImage} setReplyTo={setReplyTo} handleReaction={handleReaction} handleMessageAction={handleMessageAction} activeReactionMsg={activeReactionMsg} setActiveReactionMsg={setActiveReactionMsg} setPinModalMsg={setPinModalMsg} highlightedMsgId={highlightedMsgId} />
              </React.Fragment>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
      </div>

      <AnimatePresence>
        {pinModalMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPinModalMsg(null)} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xs rounded-3xl p-6 shadow-2xl border" style={isLoveMode ? { backgroundColor: "#2e0510", borderColor: "rgba(244,63,94,0.5)", color: "#fff" } : { backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#fff" }}>
              <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-extrabold flex items-center gap-2 text-amber-400"><Pin size={18} /> Choose Pin Duration</h3><button onClick={() => setPinModalMsg(null)} className="p-1.5 rounded-full bg-white/10 text-white"><X size={18} /></button></div>
              <p className="text-xs text-slate-300 mb-5">Kitne time ke liye ye message top par pin rakhna hai? Aap ise kabhi bhi unpin kar sakte ho.</p>
              <div className="space-y-2.5">
                {[ { label: "24 Hours", ms: 24 * 60 * 60 * 1000 }, { label: "7 Days", ms: 7 * 24 * 60 * 60 * 1000 }, { label: "Forever (Always)", ms: null } ].map((opt, idx) => (
                  <button key={idx} type="button" onClick={() => { handleMessageAction(pinModalMsg._id || pinModalMsg.id, "PIN", opt.ms); setPinModalMsg(null); }} className="w-full text-left px-4 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 transition-all active:scale-95 flex justify-between items-center"><span>{opt.label}</span><Pin size={14} className="opacity-60" /></button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-[10px] left-4 z-20 pointer-events-none flex flex-col items-center">
        <AnimatePresence>
          {isPeerTyping && (
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="relative flex flex-col items-start z-10">
               <div className={`shadow-sm rounded-full px-4 py-2 flex items-center justify-center z-20 border transition-colors duration-300`} style={isLoveMode ? { backgroundColor: "rgba(46,16,24,0.9)", borderColor: "rgba(244,63,94,0.5)" } : (isDarkMode ? { backgroundColor: "rgba(39,39,42,0.8)", borderColor: "#3f3f46" } : { backgroundColor: "rgba(255,255,255,0.9)", borderColor: "rgba(255,255,255,0.5)" })}>
                 <span className={`flex gap-1 font-black text-xl leading-none pb-1 ${isLoveMode ? "text-pink-400 drop-shadow-[0_0_5px_rgba(244,114,182,0.6)]" : "text-indigo-400 drop-shadow-sm"}`}><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '120ms'}}>.</span><span className="animate-bounce" style={{animationDelay: '240ms'}}>.</span></span>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}