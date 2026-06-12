"use client";
import { useState, useEffect, useRef } from "react";
import PusherJS from "pusher-js";
import CryptoJS from "crypto-js";
import { Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Added Framer Motion

// Components
import ModernDecoy from "./components/DecoyPortal";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import CallOverlay from "./components/CallOverlay";

const SECRET_KEY = "tour-404-classified-key";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; 

export default function Home() {
  // === CORE STATES ===
  const [appState, setAppState] = useState("DECOY"); 
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // === CHAT STATES ===
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [targetNode, setTargetNode] = useState(""); 
  const [activeChannel, setActiveChannel] = useState(""); 
  const [isPeerActive, setIsPeerActive] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  const [tick, setTick] = useState(0); 
  const [expandedImage, setExpandedImage] = useState(null);
  const [viewportHeight, setViewportHeight] = useState("100dvh");
  
  // === WEBRTC / CALLING STATES ===
  const [callState, setCallState] = useState("IDLE");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // === REFS ===
  const chatContainerRef = useRef(null); 
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null); 
  const galleryInputRef = useRef(null); 
  const prevMsgCount = useRef(0);
  const peerTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingTime = useRef(0);
  const ignorePanicRef = useRef(false);
  
  // PeerJS Refs
  const peerInstance = useRef(null);
  const currentCall = useRef(null);

  // ==========================================
  // GLOBAL PRE-FLIGHT PERMISSION
  // ==========================================
  useEffect(() => {
    const askForMediaPermissionsUpfront = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn("[SYSTEM] User denied media permissions on boot.", err);
      }
    };
    const timer = setTimeout(() => askForMediaPermissionsUpfront(), 1500);
    return () => clearTimeout(timer);
  }, []);

  // === PUSH TOKEN LOGIC ===
  const registerServiceWorkerAndSubscribe = async () => {
    const getExpoToken = () => {
      return new Promise((resolve) => {
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('EXPO_PUSH_TOKEN') : null;
        if (localToken || window.EXPO_PUSH_TOKEN) resolve(localToken || window.EXPO_PUSH_TOKEN);
        let attempts = 0;
        const interval = setInterval(() => {
          const polledToken = typeof window !== 'undefined' ? localStorage.getItem('EXPO_PUSH_TOKEN') : null;
          const currentToken = polledToken || window.EXPO_PUSH_TOKEN;
          if (currentToken) { clearInterval(interval); resolve(currentToken); }
          attempts++; if (attempts > 10) { clearInterval(interval); resolve(null); }
        }, 500);
      });
    };
    const expoToken = await getExpoToken();
    if (expoToken) {
      try {
        await fetch("/api/subscribe", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: expoToken, username: studentId.trim() }), 
        });
      } catch (err) {}
    }
  };

  const handleLogout = () => {
    endCall(); 
    setAppState("DECOY"); setStudentId(""); setPassword(""); setCurrentUser(null);
    setMessages([]); setIsPeerActive(false); setIsPeerTyping(false); setLastActiveTime(null);
    setTargetNode(""); setActiveChannel(""); setInput(""); setShowEmojis(false);
    setExpandedImage(null); clearTimeout(peerTimeout.current); clearTimeout(typingTimeout.current);
    if (peerInstance.current) { peerInstance.current.destroy(); peerInstance.current = null; }
  };

  // ==========================================
  // WEBRTC CALLING LOGIC (PEERJS)
  // ==========================================
  useEffect(() => {
    if (appState === "CHAT" && currentUser) {
      import('peerjs').then(({ default: Peer }) => {
        const peer = new Peer(studentId.trim()); 
        peer.on('call', (call) => {
          setIncomingCall(call);
          setIsVideoCall(call.metadata?.isVideo || false);
          setCallState("RINGING");
        });
        peerInstance.current = peer;
      });
    }
  }, [appState, currentUser, studentId]);

  const startCall = async (isVideo) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
      setLocalStream(stream);
      setIsVideoCall(isVideo);
      setCallState("ON_CALL");

      const call = peerInstance.current.call(targetNode, stream, { metadata: { isVideo } });
      currentCall.current = call;

      call.on('stream', (userVideoStream) => setRemoteStream(userVideoStream));
      call.on('close', () => endCall());
    } catch (err) {
      alert("Microphone/Camera permission required!");
      setCallState("IDLE");
    }
  };

  const answerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
      setLocalStream(stream);
      
      incomingCall.answer(stream);
      currentCall.current = incomingCall;
      setCallState("ON_CALL");

      incomingCall.on('stream', (userVideoStream) => setRemoteStream(userVideoStream));
      incomingCall.on('close', () => endCall());
    } catch (err) {
      alert("Microphone/Camera permission required to answer!");
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall) incomingCall.close();
    setCallState("IDLE");
    setIncomingCall(null);
  };

  const endCall = () => {
    if (currentCall.current) currentCall.current.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop()); 
    setLocalStream(null); setRemoteStream(null); setCallState("IDLE"); setIncomingCall(null);
    setIsMicMuted(false); setIsVideoMuted(false);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream && isVideoCall) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoMuted(!videoTrack.enabled);
    }
  };

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    if (appState === "CHAT") {
      window.history.pushState(null, null, window.location.href);
      const handlePopState = () => handleLogout();
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [appState]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (ignorePanicRef.current || callState !== "IDLE") return; 
        const blackout = document.createElement('div'); blackout.id = 'stealth-blackout';
        blackout.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#09090b;z-index:9999999;';
        document.body.appendChild(blackout); handleLogout();
        setTimeout(() => { const el = document.getElementById('stealth-blackout'); if (el) el.remove(); }, 500);
      } else if (document.visibilityState === "visible") {
        if (ignorePanicRef.current) setTimeout(() => { ignorePanicRef.current = false; }, 1500);
      }
    };
    const handleBlur = () => { if (ignorePanicRef.current || callState !== "IDLE") return; handleLogout(); };
    const handleFocus = () => { if (ignorePanicRef.current) setTimeout(() => { ignorePanicRef.current = false; }, 1500); };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur); window.addEventListener("focus", handleFocus);
    return () => { document.removeEventListener("visibilitychange", handleVisibilityChange); window.removeEventListener("blur", handleBlur); window.removeEventListener("focus", handleFocus); };
  }, [callState]);

  useEffect(() => {
    if (appState !== "CHAT") return;
    const interval = setInterval(() => {
      const now = Date.now(); setTick(now); 
      setMessages((prev) => prev.filter((msg) => {
        if (msg.sender === "me" && !msg.seenAt) return true;
        if (msg.seenAt) {
          const isExpired = (now - msg.seenAt) >= 15000;
          if (isExpired && msg.sender === "them" && msg._id) {
             fetch("/api/messages/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: msg._id }) }).catch(e => {});
             if (msg.text.startsWith("IMG_SYS::")) {
               const parts = msg.text.split("::"); const dToken = parts[2]; 
               if (dToken && dToken !== "no_token") fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: dToken }) }).catch(e => {});
             }
          }
          return !isExpired; 
        }
        return true;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [appState]);

  useEffect(() => {
    if (appState === "CHAT" && currentUser && activeChannel) {
      const fetchPendingMessages = async () => {
        try {
          const res = await fetch("/api/messages/fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: studentId.trim() }), });
          const data = await res.json();
          if (data.success && data.messages.length > 0) {
            const fetched = data.messages.map((m) => {
              const bytes = CryptoJS.AES.decrypt(m.encryptedText, SECRET_KEY);
              const exactTime = m.timeStr || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              return { id: m.id || m._id, _id: m._id, text: bytes.toString(CryptoJS.enc.Utf8), sender: "them", time: exactTime, seenAt: Date.now() };
            });
            setMessages((prev) => {
              const uniqueFetched = fetched.filter(newMsg => !prev.some(p => p.id === newMsg.id || p._id === newMsg._id)); return [...prev, ...uniqueFetched];
            });
            fetched.forEach(async (m) => { await fetch("/api/messages/seen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id || m._id, channel: activeChannel }) }); });
          }
        } catch (error) {}
      };
      fetchPendingMessages();
    }
  }, [appState, currentUser, activeChannel]);

  const handleLogin = async (e) => {
    e.preventDefault(); setIsLoggingIn(true); setError("");
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: studentId.trim(), pin: password }) });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user); 
        try {
          const nodeRes = await fetch("/api/nodes/getPartner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: studentId.trim() }) });
          const nodeData = await nodeRes.json();
          if (nodeData.success) { setTargetNode(nodeData.partner); setActiveChannel(nodeData.nodeName); } 
          else { setError("No active communication node found."); setIsLoggingIn(false); return; }
        } catch (e) {}
        setAppState("CHAT");
        await registerServiceWorkerAndSubscribe();
      } else { setError("Invalid University ID or PIN."); }
    } catch (err) { setError("Network error."); } finally { setIsLoggingIn(false); }
  };

  useEffect(() => {
    if (appState !== "CHAT" || !currentUser || !activeChannel) return;
    setIsPeerActive(false); setIsPeerTyping(false);

    const pusher = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe(activeChannel);
    
    channel.bind("receive_message", async (data) => {
      if (String(data.senderId).trim().toLowerCase() === studentId.trim().toLowerCase()) return;
      setLastActiveTime(Date.now()); 
      try {
        const bytes = CryptoJS.AES.decrypt(data.encryptedText, SECRET_KEY); const text = bytes.toString(CryptoJS.enc.Utf8);
        if (text === "SYS_PING_ACTIVE") { 
          setIsPeerActive(true); 
          clearTimeout(peerTimeout.current); 
          peerTimeout.current = setTimeout(() => setIsPeerActive(false), 15000); 
          return; 
        }
        if (text === "SYS_TYPING_ACTIVE") { setIsPeerTyping(true); clearTimeout(typingTimeout.current); typingTimeout.current = setTimeout(() => setIsPeerTyping(false), 2000); return; }
        if (text) {
          setIsPeerTyping(false); 
          setMessages((prev) => {
            const msgId = data.id || data._id; if (prev.some(p => p.id === msgId || p._id === msgId)) return prev;
            setTimeout(() => { fetch("/api/messages/seen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msgId, channel: activeChannel }) }).catch(() => {}); }, 50);
            return [...prev, { id: msgId || Date.now(), _id: data._id, text, sender: "them", time: data.timeStr || new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), seenAt: Date.now() }];
          });
        }
      } catch(e) {}
    });

    channel.bind("message_seen", (data) => { setMessages((prev) => prev.map((msg) => { if (msg.sender === "me" && !msg.seenAt) return { ...msg, seenAt: Date.now() }; return msg; })); });

    const pingInterval = setInterval(() => {
      const pingText = CryptoJS.AES.encrypt("SYS_PING_ACTIVE", SECRET_KEY).toString();
      fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel }), });
    }, 6000);

    return () => { clearInterval(pingInterval); clearTimeout(peerTimeout.current); clearTimeout(typingTimeout.current); pusher.unsubscribe(activeChannel); pusher.disconnect(); };
  }, [appState, currentUser, activeChannel, studentId]);

  // ---> NEW: Native Smooth Scrolling Logic <---
  const scrollToBottom = () => { 
    setTimeout(() => { 
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100); 
  };
  
  useEffect(() => { if (messages.length > prevMsgCount.current) scrollToBottom(); prevMsgCount.current = messages.length; }, [messages]);
  
  useEffect(() => {
    if (appState !== "CHAT") return;
    const handleResize = () => { if (window.visualViewport) setViewportHeight(`${window.visualViewport.height}px`); else setViewportHeight(`${window.innerHeight}px`); scrollToBottom(); };
    if (window.visualViewport) window.visualViewport.addEventListener("resize", handleResize); else window.addEventListener("resize", handleResize); handleResize();
    return () => { if (window.visualViewport) window.visualViewport.removeEventListener("resize", handleResize); else window.removeEventListener("resize", handleResize); };
  }, [appState]);

  // === MESSAGING HANDLERS ===
  const dispatchMessage = async (msgText) => {
    if (!msgText || !targetNode) return;
    const encryptedText = CryptoJS.AES.encrypt(msgText, SECRET_KEY).toString();
    const tempId = Date.now(); const timeStr = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    setMessages((prev) => [...prev, { id: tempId, _id: tempId, text: msgText, sender: "me", time: timeStr, seenAt: null }]);
    await fetch("/api/messages/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: tempId, encryptedText, senderId: studentId.trim(), receiverId: targetNode, channel: activeChannel, timeStr }), });
  };

  const handleTextSubmit = (e) => { e.preventDefault(); if (!input.trim()) return; dispatchMessage(input); setInput(""); setShowEmojis(false); inputRef.current?.focus(); };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (Date.now() - lastTypingTime.current > 1500) {
      const typingText = CryptoJS.AES.encrypt("SYS_TYPING_ACTIVE", SECRET_KEY).toString();
      fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: typingText, senderId: studentId.trim(), channel: activeChannel }), });
      lastTypingTime.current = Date.now();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setIsUploading(true); const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData, });
      const data = await res.json();
      if (data.secure_url) { const delToken = data.delete_token || "no_token"; await dispatchMessage(`IMG_SYS::${data.secure_url}::${delToken}`); } else alert("Upload failed. Please try again.");
    } catch (err) { alert("Error uploading file."); } finally { setIsUploading(false); if (cameraInputRef.current) cameraInputRef.current.value = ""; if (galleryInputRef.current) galleryInputRef.current.value = ""; }
  };

  const handlePingPartner = async () => {
    setIsPinging(true);
    try { await fetch("/api/ping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender: studentId.trim(), receiver: targetNode, channel: activeChannel }), }); setTimeout(() => setIsPinging(false), 3000); } 
    catch (error) { setIsPinging(false); }
  };

  // === RENDER UI ===
  const bgPatternDark = `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233f3f46' fill-opacity='0.2' font-family='sans-serif'%3E%3Ctext x='20' y='30' font-size='16'%3E%F0%9F%98%BA%3C/text%3E%3Ctext x='80' y='80' font-size='12'%3E%E2%99%A1%3C/text%3E%3Ctext x='140' y='40' font-size='14'%3E%E2%98%86%3C/text%3E%3Ctext x='30' y='120' font-size='16'%3E%E2%98%BA%3C/text%3E%3Ctext x='110' y='150' font-size='12'%3E%E2%9C%A8%3C/text%3E%3Ctext x='160' y='110' font-size='14'%3E%E2%99%A1%3C/text%3E%3Ctext x='80' y='10' font-size='10'%3E%E2%98%BA%3C/text%3E%3Ctext x='10' y='80' font-size='10'%3E%E2%9C%A8%3C/text%3E%3C/g%3E%3C/svg%3E")`;
  const bgPatternLight = `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d0d5df' fill-opacity='0.4' font-family='sans-serif'%3E%3Ctext x='20' y='30' font-size='16'%3E%F0%9F%98%BA%3C/text%3E%3Ctext x='80' y='80' font-size='12'%3E%E2%99%A1%3C/text%3E%3Ctext x='140' y='40' font-size='14'%3E%E2%98%86%3C/text%3E%3Ctext x='30' y='120' font-size='16'%3E%E2%98%BA%3C/text%3E%3Ctext x='110' y='150' font-size='12'%3E%E2%9C%A8%3C/text%3E%3Ctext x='160' y='110' font-size='14'%3E%E2%99%A1%3C/text%3E%3Ctext x='80' y='10' font-size='10'%3E%E2%98%BA%3C/text%3E%3Ctext x='10' y='80' font-size='10'%3E%E2%9C%A8%3C/text%3E%3C/g%3E%3C/svg%3E")`;

  // ---> NEW: Framer Motion Transitions <---
  return (
    <AnimatePresence mode="wait">
      
      {appState === "DECOY" && (
        <motion.div key="decoy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="absolute inset-0 w-full h-full bg-[#fafbfc] overflow-y-auto">
          <ModernDecoy onTrigger={() => setAppState("PORTAL_LOGIN")} />
        </motion.div>
      )}

      {appState === "PORTAL_LOGIN" && (
        <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }} className={`absolute inset-0 w-full h-full flex items-center justify-center p-4 font-sans transition-colors duration-300 z-50 ${isDarkMode ? "bg-[#09090b] text-slate-200" : "bg-slate-50 text-slate-800"}`}>
          <div className={`p-8 rounded-3xl w-full max-w-sm text-center shadow-xl transition-colors duration-300 ${isDarkMode ? "bg-[#18181b] border border-[#27272a] shadow-black/50" : "bg-white border border-slate-100 shadow-blue-900/5"}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${isDarkMode ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50 border-blue-100"}`}><Lock size={28} className={isDarkMode ? "text-blue-400" : "text-blue-600"} /></div>
            <h2 className={`mb-1 text-2xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Student Gateway</h2>
            <p className={`text-sm mb-8 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Access restricted academic modules</p>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div><input type="text" autoComplete="off" placeholder="University ID" className={`w-full p-4 rounded-xl text-[16px] focus:border-blue-500 outline-none transition border ${isDarkMode ? "bg-[#09090b] border-[#27272a] text-slate-200 placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"}`} onChange={(e) => setStudentId(e.target.value)} /></div>
              <div><input type="password" autoComplete="new-password" placeholder="Access PIN" className={`w-full p-4 rounded-xl text-[16px] focus:border-blue-500 outline-none transition border ${isDarkMode ? "bg-[#09090b] border-[#27272a] text-slate-200 placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"}`} onChange={(e) => setPassword(e.target.value)} /></div>
              {error && <p className="text-rose-500 text-xs font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
              <button type="submit" disabled={isLoggingIn} className={`w-full text-white font-semibold py-4 rounded-xl text-sm mt-2 transition-colors shadow-lg ${isLoggingIn ? "bg-blue-500/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"}`}>{isLoggingIn ? "Authenticating..." : "Authenticate"}</button>
            </form>
          </div>
        </motion.div>
      )}

      {appState === "CHAT" && (
        <motion.div key="chat" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`absolute inset-0 font-sans flex flex-col overflow-hidden transition-colors duration-300 z-50 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`} style={{ height: viewportHeight, backgroundColor: isDarkMode ? '#09090b' : '#f4f5f9' }}>
          <input type="file" accept="image/*" capture="camera" ref={cameraInputRef} className="hidden" onChange={handleImageUpload} />
          <input type="file" accept="image/*" ref={galleryInputRef} className="hidden" onChange={handleImageUpload} />

          <ChatHeader targetNode={targetNode} isPeerActive={isPeerActive} lastActiveTime={lastActiveTime} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} startCall={startCall} callState={callState} handlePingPartner={handlePingPartner} isPinging={isPinging} handleLogout={handleLogout} />
          
          <MessageList messages={messages} isDarkMode={isDarkMode} expandedImage={expandedImage} setExpandedImage={setExpandedImage} isPeerActive={isPeerActive} isPeerTyping={isPeerTyping} chatContainerRef={chatContainerRef} bgPatternDark={bgPatternDark} bgPatternLight={bgPatternLight} />
          
          <MessageInput input={input} setInput={setInput} handleTextSubmit={handleTextSubmit} handleInputChange={handleInputChange} isUploading={isUploading} showEmojis={showEmojis} setShowEmojis={setShowEmojis} cameraInputRef={cameraInputRef} galleryInputRef={galleryInputRef} isDarkMode={isDarkMode} ignorePanicRef={ignorePanicRef} scrollToBottom={scrollToBottom} />

          <CallOverlay callState={callState} isVideoCall={isVideoCall} localStream={localStream} remoteStream={remoteStream} answerCall={answerCall} rejectCall={rejectCall} endCall={endCall} isMicMuted={isMicMuted} isVideoMuted={isVideoMuted} toggleMic={toggleMic} toggleVideo={toggleVideo} />
        </motion.div>
      )}

    </AnimatePresence>
  );
}