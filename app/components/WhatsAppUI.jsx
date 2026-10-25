import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, MoreVertical, MessageSquare, Aperture, Palette, BellRing, X, Phone, Disc, User, Shield, Image as ImageIcon, PhoneIncoming, PhoneOutgoing, Video, Send, Eye, Trash2, Loader2, Heart, Gift } from 'lucide-react';

export default function WhatsAppUI({ 
    setAppState, targetNode, isDarkMode, setIsDarkMode, isLoveMode, setIsLoveMode,
    profileImage, setProfileImage, partnerImage, messages = [],
    callLogs = [], setCallLogs, myStatuses = [], setMyStatuses, partnerStatuses = [],
    onUploadProfileImage, onAddStatus, onDeleteStatus, onViewPartnerStatus, onDeleteCallLog,
    isSavingMedia, ignorePanicRef, surpriseRevealed, setSurpriseRevealed, isFetchingChat 
}) {
    const [activeTab, setActiveTab] = useState('chats');
    const [showMenu, setShowMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [pendingStatusImg, setPendingStatusImg] = useState(null);
    const [pendingStatusFile, setPendingStatusFile] = useState(null);
    const [statusCaption, setStatusCaption] = useState("");
    const [storyViewer, setStoryViewer] = useState({ open: false, owner: 'me', index: 0 });
    const [showViewsPanel, setShowViewsPanel] = useState(false);

    const [miniTimeLeft, setMiniTimeLeft] = useState({ d: 0, h: 0, m: 0 });
    useEffect(() => {
        const target = new Date("2026-12-25T00:00:00").getTime();
        const updateTimer = () => {
            const diff = target - new Date().getTime();
            if (diff > 0) {
                setMiniTimeLeft({
                    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                });
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, []);

    const activeStories = storyViewer.owner === 'me' ? myStatuses : partnerStatuses;
    const currentStory = storyViewer.open && activeStories[storyViewer.index] ? activeStories[storyViewer.index] : null;

    const handleProfileUpload = async (e) => {
        if (ignorePanicRef) setTimeout(() => { ignorePanicRef.current = false; }, 1000);
        e.stopPropagation();
        const file = e.target.files?.[0];
        if (!file) return;
        if (typeof onUploadProfileImage === "function") await onUploadProfileImage(file);
        else if (typeof setProfileImage === "function") {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
        e.target.value = null;
    };

    const handleStatusFileSelect = (e) => {
        if (ignorePanicRef) setTimeout(() => { ignorePanicRef.current = false; }, 1000);
        e.stopPropagation();
        const file = e.target.files?.[0];
        if (file) {
            setPendingStatusFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPendingStatusImg(reader.result);
            reader.readAsDataURL(file);
        }
        e.target.value = null; 
    };

    const publishStatus = async () => {
        if (!pendingStatusImg) return;
        if (typeof onAddStatus === "function") await onAddStatus(pendingStatusFile, pendingStatusImg, statusCaption);
        else if (typeof setMyStatuses === "function") setMyStatuses(prev => [...prev, { id: String(Date.now()), image: pendingStatusImg, text: statusCaption, time: Date.now(), seenBy: [] }]);
        setPendingStatusImg(null); setPendingStatusFile(null); setStatusCaption("");
    };

    const handleDeleteCurrentStatus = async () => {
        if (!currentStory) return;
        if (typeof onDeleteStatus === "function") await onDeleteStatus(currentStory.id);
        else if (typeof setMyStatuses === "function") setMyStatuses(prev => prev.filter(s => String(s.id) !== String(currentStory.id)));
        setStoryViewer({ open: false, owner: 'me', index: 0 }); setShowViewsPanel(false);
    };

    const handleRemoveCallLog = async (id) => {
        if (typeof onDeleteCallLog === "function") await onDeleteCallLog(id);
        else if (typeof setCallLogs === "function") setCallLogs(prev => prev.filter(call => String(call.id) !== String(id)));
    };

    useEffect(() => {
        if (storyViewer.open && storyViewer.owner === 'partner' && currentStory && typeof onViewPartnerStatus === "function") {
            onViewPartnerStatus(currentStory.id);
        }
    }, [storyViewer.open, storyViewer.owner, storyViewer.index, currentStory?.id]);

    useEffect(() => {
        if (storyViewer.open && currentStory && !showViewsPanel) {
            const timer = setTimeout(() => {
                if (storyViewer.index >= activeStories.length - 1) setStoryViewer({ open: false, owner: 'me', index: 0 });
                else setStoryViewer(prev => ({ ...prev, index: prev.index + 1 }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [storyViewer.open, storyViewer.index, activeStories.length, showViewsPanel, currentStory]);

    const bgMain = isLoveMode ? "bg-[#050002] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2e0510] via-[#050002] to-black" : (isDarkMode ? "bg-[#09090b]" : "bg-[#f8fafc]");
    const textMain = isLoveMode ? "text-rose-100" : (isDarkMode ? "text-slate-100" : "text-slate-800");
    const textSub = isLoveMode ? "text-rose-300/70" : (isDarkMode ? "text-slate-400" : "text-slate-500");
    const cardBg = isLoveMode ? "bg-[#1a050f]/80 border-rose-900/40" : (isDarkMode ? "bg-[#18181b]/80 border-[#27272a]" : "bg-white/80 border-slate-200");
    const headerBg = isLoveMode ? "bg-[#1a050f]/90 border-rose-900/50" : (isDarkMode ? "bg-[#09090b]/90 border-[#27272a]" : "bg-white/90 border-slate-100");
    const accentColor = isLoveMode ? "text-rose-500" : "text-indigo-500";

    const renderStatusRing = (count) => {
        if (!count || count === 0) return null;
        if (count === 1) return <div className={`absolute inset-0 rounded-full border-2 ${isLoveMode ? 'border-rose-500' : 'border-indigo-500'}`} />;
        const r = 26; const circumference = 2 * Math.PI * r; const gap = 6; const dash = circumference / count;
        return (
            <svg viewBox="0 0 60 60" className="absolute inset-0 w-full h-full -rotate-90">
                {Array.from({ length: count }).map((_, i) => (
                    <circle key={i} cx="30" cy="30" r={r} fill="none" stroke={isLoveMode ? '#f43f5e' : '#6366f1'} strokeWidth="2.5" strokeDasharray={`${dash - gap} ${gap}`} strokeDashoffset={-(dash * i)} />
                ))}
            </svg>
        );
    };

    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    let lastMsgPreview = "Start chatting...";
    if (lastMessage) {
        let rawText = lastMessage.text || "";
        if (rawText.includes("RPL_SYS|||")) {
            rawText = rawText.split("|||").pop(); 
        }
        
        if (lastMessage.isDeleted) lastMsgPreview = "🚫 This message was deleted";
        else if (rawText.startsWith("IMG_SYS::")) lastMsgPreview = "📷 Photo";
        else if (rawText.startsWith("VID_SYS::")) lastMsgPreview = "🎥 Video";
        else if (rawText.startsWith("STK_SYS::")) lastMsgPreview = "✨ Sticker";
        else if (rawText.startsWith("AUD_SYS::")) lastMsgPreview = "🎤 Voice Message";
        else lastMsgPreview = rawText;
    }

    const defaultPartnerImg = "/love.png";
    const defaultMyImg = "/cat.png";

    return (
        <motion.div key="whatsapp-ui" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className={`absolute inset-0 w-full h-[100dvh] flex flex-col z-50 overflow-hidden ${bgMain} ${textMain}`}>
            
            <div className={`px-5 py-3 flex justify-between items-center z-20 backdrop-blur-xl border-b shadow-sm ${headerBg}`}>
                <div className="flex flex-col">
                    <h1 className={`text-2xl font-black tracking-tighter bg-clip-text text-transparent leading-none ${isLoveMode ? "bg-gradient-to-r from-rose-400 to-pink-500" : "bg-gradient-to-r from-indigo-500 to-cyan-500"}`}>
                        Dishaag
                    </h1>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-400 cursor-pointer" onClick={() => setAppState("ANNIVERSARY_POPUP")}>
                        <Gift size={12} className="animate-pulse" />
                        <span>{miniTimeLeft.d}d {miniTimeLeft.h}h {miniTimeLeft.m}m to go</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                    <button onClick={() => setAppState("SNAP_MODE")} className={`p-2.5 rounded-full transition-all active:scale-90 ${isLoveMode ? "hover:bg-rose-900/30 text-rose-300" : (isDarkMode ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600")}`}><Camera size={22} strokeWidth={2.5} /></button>
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className={`p-2.5 rounded-full transition-all active:scale-90 ${isLoveMode ? "hover:bg-rose-900/30 text-rose-300" : (isDarkMode ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600")}`}><MoreVertical size={22} strokeWidth={2.5} /></button>
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, originTopRight: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`absolute right-0 top-12 w-48 py-2 rounded-2xl shadow-2xl z-50 border backdrop-blur-xl ${isLoveMode ? "bg-[#2e0510]/95 border-rose-500/30" : (isDarkMode ? "bg-[#18181b]/95 border-[#3f3f46]" : "bg-white/95 border-slate-200")}`}>
                                    <button onClick={(e) => { e.stopPropagation(); setShowProfileModal(true); setShowMenu(false); }} className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-3 ${isLoveMode ? "hover:bg-rose-900/40 text-rose-100" : (isDarkMode ? "hover:bg-white/10 text-slate-200" : "hover:bg-slate-50 text-slate-800")}`}>
                                        <User size={16} /> Profile & Settings
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 px-3 sm:px-4 pt-4 space-y-3">
                {activeTab === 'chats' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        
                        {isFetchingChat ? (
                            <div className={`flex items-center p-4 rounded-3xl border backdrop-blur-md shadow-lg ${cardBg}`}>
                                <div className="w-14 h-14 rounded-full bg-slate-500/20 animate-pulse shrink-0 mr-4" />
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="h-4 bg-slate-500/20 rounded w-1/3 animate-pulse" />
                                    <div className="h-3 bg-slate-500/20 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => setAppState("CHAT")} className={`flex items-center p-4 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border backdrop-blur-md shadow-lg ${cardBg}`}>
                                <div className={`w-14 h-14 rounded-full overflow-hidden mr-4 border-2 shadow-inner shrink-0 ${isLoveMode ? "border-rose-400 shadow-rose-500/30" : "border-indigo-400"}`}>
                                    <img 
                                        src={partnerImage || defaultPartnerImg} 
                                        alt="Partner" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultPartnerImg; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h2 className="font-bold text-lg truncate">{targetNode || "Partner"}</h2>
                                        <span className={`text-xs font-semibold ${accentColor}`}>{lastMessage ? lastMessage.time : ""}</span>
                                    </div>
                                    <p className={`text-sm truncate font-medium ${textSub}`}>{lastMsgPreview}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <h3 className={`px-2 mb-3 text-xs font-black uppercase tracking-widest ${textSub}`}>Secret App Modules</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div onClick={() => setAppState("SNAP_MODE")} className={`flex items-center p-4 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border backdrop-blur-md shadow-sm ${cardBg}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mr-4"><Aperture className="text-purple-500" size={24} /></div>
                                    <div><h2 className="font-bold text-base">Snap Module</h2><p className={`text-xs font-medium mt-0.5 ${textSub}`}>Volatile visual transmission</p></div>
                                </div>
                                <div onClick={() => setAppState("SCRIBBLE_MODE")} className={`flex items-center p-4 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border backdrop-blur-md shadow-sm ${cardBg}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mr-4"><Palette className="text-emerald-500" size={24} /></div>
                                    <div><h2 className="font-bold text-base">Scribble Game</h2><p className={`text-xs font-medium mt-0.5 ${textSub}`}>Live drawing & guessing</p></div>
                                </div>
                                <div onClick={() => setAppState("CUSTOM_PING")} className={`flex items-center p-4 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border backdrop-blur-md shadow-sm ${cardBg}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mr-4"><BellRing className="text-amber-500" size={24} /></div>
                                    <div><h2 className="font-bold text-base">Custom Alert</h2><p className={`text-xs font-medium mt-0.5 ${textSub}`}>Send targeted notifications</p></div>
                                </div>
                            </div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                            className="mt-6 mb-8 flex flex-col items-center justify-center p-6 text-center select-none"
                        >
                            <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                                    className={`absolute inset-0 rounded-full blur-xl ${isLoveMode ? 'bg-rose-500/30' : 'bg-indigo-500/20'}`}
                                />
                                <Heart size={40} strokeWidth={1} className={`${isLoveMode ? 'text-rose-400' : 'text-indigo-400'} animate-pulse`} fill="currentColor" />
                            </div>
                            <h3 className={`text-lg font-serif italic mb-1 ${isLoveMode ? 'text-rose-300' : 'text-slate-400'}`}>
                                "You are my today and all of my tomorrows."
                            </h3>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isLoveMode ? 'text-rose-500/60' : 'text-slate-500/50'}`}>
                                Marshmallow & Nutella
                            </p>
                        </motion.div>
                    </motion.div>
                )}
                
                {activeTab === 'status' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h3 className={`px-2 text-xs font-black uppercase tracking-widest ${textSub}`}>My Status Updates</h3>
                        <div 
                            className={`relative flex items-center p-4 rounded-3xl border backdrop-blur-md shadow-sm overflow-hidden ${cardBg} ${myStatuses.length > 0 ? "cursor-pointer hover:scale-[1.01] transition-transform" : ""}`}
                            onClick={() => { if (myStatuses.length > 0) setStoryViewer({ open: true, owner: 'me', index: 0 }); }}
                        >
                            {myStatuses.length > 0 && (
                                <div className="absolute inset-0 z-0 opacity-20 blur-xl pointer-events-none">
                                    <img src={myStatuses[myStatuses.length - 1].image} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="relative w-16 h-16 flex items-center justify-center mr-4 z-10">
                                {renderStatusRing(myStatuses.length)}
                                <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-slate-200">
                                   <img 
                                        src={myStatuses.length > 0 ? myStatuses[myStatuses.length - 1].image : (profileImage || defaultMyImg)} 
                                        alt="My Status" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultMyImg; }}
                                    />
                                </div>
                                <label 
                                    onPointerDown={(e) => { e.stopPropagation(); if (ignorePanicRef) ignorePanicRef.current = true; }} 
                                    onClick={(e) => { e.stopPropagation(); if (ignorePanicRef) ignorePanicRef.current = true; }}
                                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black cursor-pointer hover:scale-110 transition-transform z-20" 
                                    style={{ backgroundColor: isLoveMode ? "#f43f5e" : "#6366f1" }}
                                >
                                    <span className="text-white text-lg font-bold leading-none mb-0.5 pointer-events-none">+</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleStatusFileSelect} />
                                </label>
                            </div>
                            <div className="relative z-10 flex-1">
                                <h2 className="font-bold text-lg">My Status</h2>
                                <p className={`text-sm font-medium ${textSub}`}>
                                    {myStatuses.length > 0 ? `${myStatuses.length} update(s) • Tap to view` : "Tap + to add status (24h)"}
                                </p>
                            </div>
                        </div>

                        <h3 className={`px-2 pt-2 text-xs font-black uppercase tracking-widest ${textSub}`}>Partner Updates</h3>
                        {partnerStatuses.length === 0 ? (
                            <div className={`p-8 rounded-3xl border text-center text-sm font-medium ${cardBg} ${textSub}`}>
                                No recent updates from {targetNode || "partner"}.
                            </div>
                        ) : (
                            <div 
                                onClick={() => setStoryViewer({ open: true, owner: 'partner', index: 0 })}
                                className={`relative flex items-center p-4 rounded-3xl border backdrop-blur-md shadow-sm overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform ${cardBg}`}
                            >
                                <div className="relative w-16 h-16 flex items-center justify-center mr-4 z-10">
                                    {renderStatusRing(partnerStatuses.length)}
                                    <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-slate-200">
                                        <img 
                                            src={partnerStatuses[partnerStatuses.length - 1].image || partnerImage || defaultPartnerImg} 
                                            alt="Partner Status" 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = defaultPartnerImg; }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-bold text-lg">{targetNode || "Partner"}</h2>
                                    <p className={`text-sm font-medium ${textSub}`}>
                                        {partnerStatuses.length} new update(s) • Tap to view
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'calls' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h3 className={`px-2 text-xs font-black uppercase tracking-widest ${textSub}`}>Recent Calls</h3>
                        {callLogs.length === 0 ? (
                            <div className={`flex items-center p-4 rounded-3xl border backdrop-blur-md shadow-sm ${cardBg}`}>
                                <div className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center bg-slate-500/10`}>
                                    <Phone className={textSub} size={20} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-bold text-lg opacity-50">No call history</h2>
                                    <p className={`text-sm font-medium ${textSub}`}>Your secure calls in this room will appear here.</p>
                                </div>
                            </div>
                        ) : (
                            callLogs.map((call) => (
                                <div key={call.id} className={`flex items-center justify-between p-4 rounded-3xl border backdrop-blur-md shadow-sm ${cardBg}`}>
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 rounded-full mr-4 overflow-hidden border ${isLoveMode ? "border-rose-400" : "border-indigo-400"}`}>
                                            <img 
                                                src={partnerImage || defaultPartnerImg} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.onerror = null; e.target.src = defaultPartnerImg; }}
                                            />
                                        </div>
                                        <div>
                                            <h2 className={`font-bold text-lg ${call.type === 'missed' ? 'text-rose-500' : ''}`}>{targetNode}</h2>
                                            <div className={`flex items-center gap-1 text-sm font-medium ${textSub}`}>
                                                {call.type === 'incoming' ? <PhoneIncoming size={14} className="text-emerald-500"/> : <PhoneOutgoing size={14} className="text-blue-500"/>}
                                                {call.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-full ${isLoveMode ? "bg-rose-500/10 text-rose-500" : "bg-indigo-500/10 text-indigo-500"}`}>
                                            {call.isVideo ? <Video size={20}/> : <Phone size={20}/>}
                                        </div>
                                        <button onClick={() => handleRemoveCallLog(call.id)} className="p-2 rounded-full hover:bg-rose-500/20 text-rose-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </div>

            <div className={`absolute bottom-0 inset-x-0 pb-safe pt-2 px-6 flex justify-between items-center backdrop-blur-2xl border-t z-20 ${headerBg}`}>
                {[{ id: 'chats', icon: MessageSquare, label: 'Chats' }, { id: 'status', icon: Disc, label: 'Updates' }, { id: 'calls', icon: Phone, label: 'Calls' }].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }} className={`flex flex-col items-center gap-1 p-2 w-20 transition-all duration-300 ${isActive ? accentColor : textSub}`}>
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? (isLoveMode ? "bg-rose-500/20" : "bg-indigo-500/20") : "bg-transparent"}`}><tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} /></div>
                            <span className={`text-[10px] font-bold tracking-wide ${isActive ? "opacity-100" : "opacity-70"}`}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* STATUS UPLOAD PREVIEW MODAL */}
            <AnimatePresence>
                {pendingStatusImg && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-[150] flex flex-col bg-black/95 backdrop-blur-md">
                        <div className="p-4 flex items-center justify-between z-10">
                            <button onClick={() => { setPendingStatusImg(null); setPendingStatusFile(null); }} className="p-2 bg-white/10 rounded-full text-white"><X size={24}/></button>
                            <span className="text-white font-bold text-lg">New Status (24h)</span>
                            <div className="w-10"></div>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                            <img src={pendingStatusImg} alt="Preview" className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain" />
                        </div>
                        <div className="p-4 pb-safe bg-black/50 border-t border-white/10 flex items-center gap-3">
                            <input type="text" placeholder="Add a caption..." value={statusCaption} onChange={(e) => setStatusCaption(e.target.value)} className="flex-1 bg-white/10 text-white placeholder-white/50 px-5 py-3.5 rounded-2xl outline-none" />
                            <button disabled={isSavingMedia} onClick={publishStatus} className={`p-3.5 rounded-2xl text-white ${isLoveMode ? "bg-rose-500" : "bg-indigo-500"}`}>
                                {isSavingMedia ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="ml-1" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STORY VIEWER MODAL */}
            <AnimatePresence>
                {storyViewer.open && currentStory && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] flex flex-col bg-black">
                        <div className="absolute top-2 inset-x-2 flex gap-1 z-30">
                            {activeStories.map((_, i) => (
                                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-white" 
                                        initial={{ width: i < storyViewer.index ? "100%" : "0%" }} 
                                        animate={{ width: i === storyViewer.index ? "100%" : (i < storyViewer.index ? "100%" : "0%") }} 
                                        transition={i === storyViewer.index ? { duration: 5, ease: "linear" } : { duration: 0 }} 
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute top-6 inset-x-4 flex justify-between items-center z-30">
                            <div className="flex items-center gap-2.5 text-white font-bold">
                                <img 
                                    src={storyViewer.owner === 'me' ? (profileImage || defaultMyImg) : (partnerImage || defaultPartnerImg)} 
                                    className="w-9 h-9 rounded-full object-cover border border-white/40"
                                    onError={(e) => { e.target.onerror = null; e.target.src = storyViewer.owner === 'me' ? defaultMyImg : defaultPartnerImg; }}
                                />
                                <div>
                                    <p className="text-sm leading-tight">{storyViewer.owner === 'me' ? "My Status" : (targetNode || "Partner")}</p>
                                    <p className="text-[10px] text-white/70 font-normal">{new Date(currentStory.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <button onClick={() => { setStoryViewer({ open: false, owner: 'me', index: 0 }); setShowViewsPanel(false); }} className="text-white p-1.5 bg-white/10 rounded-full"><X size={24}/></button>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="absolute left-0 inset-y-0 w-1/3 z-20" onClick={() => setStoryViewer(prev => ({ ...prev, index: Math.max(0, prev.index - 1) }))} />
                            <div className="absolute right-0 inset-y-0 w-1/3 z-20" onClick={() => { if (storyViewer.index >= activeStories.length - 1) setStoryViewer({ open: false, owner: 'me', index: 0 }); else setStoryViewer(prev => ({ ...prev, index: prev.index + 1 })); }} />
                            <img src={currentStory.image} className="w-full h-full object-contain" />
                            {currentStory.text && (
                                <div className="absolute bottom-20 bg-black/60 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl text-base font-medium max-w-[85%] text-center z-20">
                                    {currentStory.text}
                                </div>
                            )}
                        </div>

                        {storyViewer.owner === 'me' && (
                            <div className="absolute bottom-6 inset-x-4 flex justify-between items-center z-30">
                                <button onClick={() => setShowViewsPanel(true)} className="flex items-center gap-1.5 text-white bg-black/60 px-5 py-2.5 rounded-full font-bold backdrop-blur-md border border-white/10">
                                    <Eye size={18}/> {(currentStory.seenBy || []).length}
                                </button>
                                <button onClick={handleDeleteCurrentStatus} className="text-rose-500 bg-black/60 p-2.5 rounded-full backdrop-blur-md border border-white/10">
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        )}

                        {showViewsPanel && storyViewer.owner === 'me' && (
                            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} className="absolute bottom-0 inset-x-0 h-1/2 bg-zinc-900 rounded-t-3xl p-6 z-40 border-t border-zinc-800 shadow-2xl">
                                <div className="flex justify-between items-center text-white mb-6">
                                    <h2 className="font-bold text-lg flex items-center gap-2"><Eye size={20}/> Viewed by {(currentStory.seenBy || []).length}</h2>
                                    <button onClick={() => setShowViewsPanel(false)}><X size={24}/></button>
                                </div>
                                <div className="space-y-4 overflow-y-auto max-h-[calc(100%-60px)]">
                                    {(currentStory.seenBy || []).length === 0 ? (
                                        <p className="text-slate-400 text-sm text-center py-8">No views yet.</p>
                                    ) : (
                                        currentStory.seenBy.map((view, i) => (
                                            <div key={i} className="flex items-center gap-4 text-white">
                                                <img 
                                                    src={view.pfp || partnerImage || defaultPartnerImg} 
                                                    className="w-11 h-11 rounded-full object-cover border border-zinc-700" 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultPartnerImg; }}
                                                />
                                                <div>
                                                    <p className="font-bold text-sm">{view.name}</p>
                                                    <p className="text-xs text-slate-400">Seen at {view.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SETTINGS MODAL */}
            <AnimatePresence>
                {showProfileModal && (
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`absolute inset-0 z-[100] flex flex-col ${bgMain} ${textMain}`}
                    >
                        <div className={`px-5 py-4 flex items-center gap-4 backdrop-blur-xl border-b shadow-sm z-10 ${headerBg}`}>
                            <button onClick={(e) => { e.stopPropagation(); setShowProfileModal(false); }} className={`p-2 rounded-full active:scale-90 transition-transform ${isDarkMode ? "bg-white/10" : "bg-black/5"}`}><X size={20}/></button>
                            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-10" onClick={(e) => e.stopPropagation()}>
                            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col items-center text-center ${cardBg}`}>
                                <div className="relative group w-32 h-32 rounded-full overflow-hidden mb-4 bg-slate-200 border-4 border-slate-300/50 shadow-inner">
                                    <img 
                                        src={profileImage || defaultMyImg} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultMyImg; }}
                                    />
                                    <label 
                                        onPointerDown={(e) => { e.stopPropagation(); if (ignorePanicRef) ignorePanicRef.current = true; }}
                                        onClick={(e) => { e.stopPropagation(); if (ignorePanicRef) ignorePanicRef.current = true; }}
                                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm z-50"
                                    >
                                        {isSavingMedia ? <Loader2 className="text-white animate-spin" size={28} /> : (
                                            <><Camera className="text-white mb-1 pointer-events-none" size={28} /><span className="text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none">Edit</span></>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
                                    </label>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">You</h2>
                                <p className={`mt-1 text-sm font-medium ${textSub}`}>Saved securely in Database for this room.</p>
                            </div>

                            <div className="space-y-3">
                                <div onClick={(e) => { e.stopPropagation(); setIsDarkMode(!isDarkMode); }} className={`flex items-center p-4 rounded-3xl cursor-pointer transition-transform active:scale-95 border shadow-sm ${cardBg}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-emerald-500/10`}><Shield className="text-emerald-500" size={24} /></div>
                                    <div className="flex-1"><h2 className="font-bold text-base">Account Privacy</h2><p className={`text-xs font-medium mt-0.5 ${textSub}`}>Tap to toggle Dark/Light Stealth</p></div>
                                </div>
                                <div onClick={(e) => { e.stopPropagation(); setIsLoveMode(!isLoveMode); }} className={`flex items-center p-4 rounded-3xl cursor-pointer transition-transform active:scale-95 border shadow-sm ${cardBg}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-rose-500/10`}><ImageIcon className="text-rose-500" size={24} /></div>
                                    <div className="flex-1"><h2 className="font-bold text-base">Chat Aesthetics</h2><p className={`text-xs font-medium mt-0.5 ${textSub}`}>Tap to toggle Romantic Vibe</p></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SURPRISE LOVE BOX MODAL */}
            <AnimatePresence>
                {!surpriseRevealed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                        <div className="hidden" aria-hidden="true">
                            <img src="/us.jpg" fetchPriority="high" loading="eager" alt="preload" />
                            <audio src="/song.mp3" preload="auto" />
                        </div>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }} transition={{ type: "spring", damping: 15 }} className="w-full max-w-sm rounded-[40px] bg-gradient-to-b from-[#2e0510] to-[#0c0507] p-8 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col items-center text-center relative overflow-hidden">
                            <button onClick={() => setSurpriseRevealed(true)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-rose-200 transition-colors"><X size={18} /></button>
                            <div className="text-6xl mb-6 animate-bounce mt-4">💝</div>
                            <h2 className="text-2xl font-black text-rose-200 mb-2">A Secret Surprise!</h2>
                            <p className="text-rose-300/80 text-sm mb-8">For my Chaand, something special awaits inside...</p>
                            <button onClick={() => { setSurpriseRevealed(true); setAppState("ANNIVERSARY_POPUP"); }} className="px-8 py-4 bg-rose-500 text-white rounded-full font-bold tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                Click Here <Heart size={16} className="animate-pulse fill-white" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}