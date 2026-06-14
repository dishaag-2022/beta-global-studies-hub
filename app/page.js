"use client";
import { useState, useEffect, useRef } from "react";
import PusherJS from "pusher-js";
import CryptoJS from "crypto-js";
import { Lock, MessageSquare, Camera, Aperture, ChevronRight, ChevronLeft, X, Loader2, Palette, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ModernDecoy from "./components/DecoyPortal";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import CallOverlay from "./components/CallOverlay";
import ScribbleBoard from "./components/ScribbleBoard";
import CustomPing from "./components/CustomPing";

const SECRET_KEY = "tour-404-classified-key";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const SNAP_FILTERS = [
  { name: "Raw", filter: "none" },
  { name: "Tokyo Night", filter: "contrast(1.2) saturate(1.5) hue-rotate(-15deg)" },
  { name: "Vintage", filter: "sepia(0.6) contrast(1.1) brightness(0.9)" },
  { name: "Cyberpunk", filter: "contrast(1.3) saturate(1.8) hue-rotate(45deg)" },
  { name: "Noir", filter: "grayscale(1) contrast(1.2)" },
  { name: "Dream", filter: "blur(1px) saturate(1.2) brightness(1.1)" },
  { name: "Thermal", filter: "invert(1) hue-rotate(180deg)" },
];

export default function Home() {
  const [appState, setAppState] = useState("DECOY");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoveMode, setIsLoveMode] = useState(false); 

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
  const [expandedImage, setExpandedImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const [callState, setCallState] = useState("IDLE");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isRemoteVideoMuted, setIsRemoteVideoMuted] = useState(false);
  const [isRemoteMicMuted, setIsRemoteMicMuted] = useState(false);

  const [snapFilterIndex, setSnapFilterIndex] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const pressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const [localFilter, setLocalFilter] = useState(0);
  const [remoteFilter, setRemoteFilter] = useState(0);
  const [isCallMinimized, setIsCallMinimized] = useState(false);

  const chatWrapperRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const peerTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingTime = useRef(0);
  const ignorePanicRef = useRef(false);
  const snapVideoRef = useRef(null);
  
  const peerInstance = useRef(null);
  const currentCall = useRef(null);

  useEffect(() => {
    if (appState !== "CHAT") return;
    
    const handleViewportChange = () => {
      if (chatWrapperRef.current && window.visualViewport) {
        chatWrapperRef.current.style.height = `${window.visualViewport.height}px`;
        chatWrapperRef.current.style.top = `${window.visualViewport.offsetTop}px`;
      } else if (chatWrapperRef.current) {
        chatWrapperRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      handleViewportChange();
    } else {
      window.addEventListener('resize', handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [appState]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const sendDrawEvent = (x0, y0, x1, y1, color) => {
    const drawData = `SYS_DRAW::${x0.toFixed(4)},${y0.toFixed(4)},${x1.toFixed(4)},${y1.toFixed(4)},${color}`;
    const encryptedText = CryptoJS.AES.encrypt(drawData, SECRET_KEY).toString();
    fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
  };

  const sendClearEvent = () => {
    const encryptedText = CryptoJS.AES.encrypt("SYS_CLEAR_CANVAS", SECRET_KEY).toString();
    fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
  };

  useEffect(() => {
    const askForMediaPermissionsUpfront = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {}
    };
    const timer = setTimeout(() => askForMediaPermissionsUpfront(), 1500);
    return () => clearTimeout(timer);
  }, []);

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
    setExpandedImage(null); setReplyTo(null); clearTimeout(peerTimeout.current); clearTimeout(typingTimeout.current);
    if (peerInstance.current) { peerInstance.current.destroy(); peerInstance.current = null; }
  };

  useEffect(() => {
    if ((appState === "CHAT" || appState === "SNAP_MODE" || appState === "SCRIBBLE_MODE" || appState === "CUSTOM_PING") && currentUser) {
      
      if (peerInstance.current && !peerInstance.current.destroyed) return;

      import('peerjs').then(({ default: Peer }) => {
        const peer = new Peer(studentId.trim(), {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' }
            ]
          }
        });
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
      if (!peerInstance.current) throw new Error("Network not ready yet. Please wait a second.");
      
      if (peerInstance.current.destroyed) {
        throw new Error("Connection lost. Please Log out and Log back in.");
      }

      if (peerInstance.current.disconnected) {
        peerInstance.current.reconnect();
      }

      const isVideoReq = isVideo === true;
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoReq, audio: true });

      if (stream.getAudioTracks().length > 0) {
        stream.getAudioTracks()[0].enabled = false;
      }
      setIsMicMuted(true); setIsVideoMuted(false); setIsRemoteVideoMuted(false); setIsRemoteMicMuted(false);
      setLocalFilter(0); setRemoteFilter(0); setIsCallMinimized(false);

      setLocalStream(stream);
      setIsVideoCall(isVideoReq);
      setCallState("ON_CALL");

      const call = peerInstance.current.call(targetNode, stream, { metadata: { isVideo: isVideoReq } });
      
      if (!call) throw new Error("Partner is offline or network is busy.");
      currentCall.current = call;

      call.on('stream', (userVideoStream) => setRemoteStream(userVideoStream));
      call.on('close', () => endCall());
      call.on('error', () => endCall()); 
    } catch (err) {
      const isDeviceErr = err.name === "NotAllowedError" || err.name === "NotFoundError";
      const prefix = isDeviceErr ? "Camera/Mic Error:" : "Connection Status:";
      alert(`❌ ${prefix} ${err.message}`);
      setCallState("IDLE");
    }
  };

  const answerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });

      if (stream.getAudioTracks().length > 0) {
        stream.getAudioTracks()[0].enabled = false;
      }
      setIsMicMuted(true); setIsVideoMuted(false); setIsRemoteVideoMuted(false); setIsRemoteMicMuted(false);
      setLocalFilter(0); setRemoteFilter(0); setIsCallMinimized(false);

      setLocalStream(stream);

      if (!incomingCall) throw new Error("Incoming call dropped or partner disconnected.");
      
      incomingCall.answer(stream);
      currentCall.current = incomingCall;
      setCallState("ON_CALL");

      incomingCall.on('stream', (userVideoStream) => setRemoteStream(userVideoStream));
      incomingCall.on('close', () => endCall());
      incomingCall.on('error', () => endCall()); 
    } catch (err) {
      const isDeviceErr = err.name === "NotAllowedError" || err.name === "NotFoundError";
      const prefix = isDeviceErr ? "Camera/Mic Error:" : "Connection Status:";
      alert(`❌ ${prefix} ${err.message}`);
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
    setIsMicMuted(false); setIsVideoMuted(false); setIsRemoteVideoMuted(false); setIsRemoteMicMuted(false);
    setIsCallMinimized(false); setLocalFilter(0); setRemoteFilter(0);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      const newMicState = !audioTrack.enabled;
      setIsMicMuted(newMicState);

      const pingText = CryptoJS.AES.encrypt(newMicState ? "SYS_MIC_OFF" : "SYS_MIC_ON", SECRET_KEY).toString();
      fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
    }
  };

  const toggleVideo = () => {
    if (localStream && isVideoCall) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      const newVideoState = !videoTrack.enabled;
      setIsVideoMuted(newVideoState);

      const pingText = CryptoJS.AES.encrypt(newVideoState ? "SYS_VID_OFF" : "SYS_VID_ON", SECRET_KEY).toString();
      fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
    }
  };

  // 🔥 MULTI-USER REACTION LOGIC
  const handleReaction = (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId || m._id === msgId) {
         const newReactions = { ...(m.reactions || {}) };
         if (emoji) newReactions.me = emoji;
         else delete newReactions.me;
         return { ...m, reactions: newReactions };
      }
      return m;
    }));
    const pingText = CryptoJS.AES.encrypt(`SYS_REACT::${msgId}::${emoji}`, SECRET_KEY).toString();
    fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
  };

  useEffect(() => {
    if (appState === "CHAT" || appState === "SNAP_MODE" || appState === "SCRIBBLE_MODE" || appState === "CUSTOM_PING") {
      window.history.pushState(null, null, window.location.href);
      const handlePopState = () => setAppState("MODE_SELECTION");
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    } else if (appState === "MODE_SELECTION") {
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

    const handleBlur = () => {
      if (ignorePanicRef.current || callState !== "IDLE") return;
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') return;
      handleLogout();
    };

    const handleFocus = () => { if (ignorePanicRef.current) setTimeout(() => { ignorePanicRef.current = false; }, 1500); };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [callState]);

  useEffect(() => {
    if (appState !== "CHAT" && appState !== "SNAP_MODE") return;
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => {
        let hasChanges = false;
        const newMessages = prev.filter((msg) => {
          if (msg.sender === "me" && !msg.seenAt) return true;
          if (msg.seenAt) {
            const isExpired = (now - msg.seenAt) >= 15000;
            if (isExpired && msg.sender === "them" && msg._id) {
               hasChanges = true;
               fetch("/api/messages/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: msg._id }) }).catch(e => {});
               if (msg.text.startsWith("IMG_SYS::") || msg.text.startsWith("VID_SYS::") || msg.text.startsWith("STK_SYS::")) {
                 const parts = msg.text.split("::"); const dToken = parts[2];
                 if (dToken && dToken !== "no_token") fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: dToken }) }).catch(e => {});
               }
            }
            if (isExpired) hasChanges = true;
            return !isExpired;
          }
          return true;
        });
        return hasChanges ? newMessages : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [appState]);

  useEffect(() => {
    if ((appState === "CHAT" || appState === "SNAP_MODE") && currentUser && activeChannel) {
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

  useEffect(() => {
    let stream = null;
    if (appState === "SNAP_MODE") {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
        .then((s) => {
          stream = s;
          if (snapVideoRef.current) {
            snapVideoRef.current.srcObject = s;
          }
        })
        .catch(() => alert("Camera & Mic access required for Snap Video"));
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [appState]);

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
        setAppState("MODE_SELECTION");
        await registerServiceWorkerAndSubscribe();
      } else { setError("Invalid University ID or PIN."); }
    } catch (err) { setError("Network error."); } finally { setIsLoggingIn(false); }
  };

  useEffect(() => {
    if ((appState !== "CHAT" && appState !== "SNAP_MODE" && appState !== "SCRIBBLE_MODE" && appState !== "CUSTOM_PING") || !currentUser || !activeChannel) return;
    setIsPeerActive(false); setIsPeerTyping(false);

    const pusher = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe(activeChannel);

    const sendPresencePing = () => {
      const pingText = CryptoJS.AES.encrypt("SYS_PING_ACTIVE", SECRET_KEY).toString();
      fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
    };

    const sendHello = () => {
      const helloText = CryptoJS.AES.encrypt("SYS_NODE_CONNECTED", SECRET_KEY).toString();
      fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: helloText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
    };

    channel.bind("receive_message", async (data) => {
      if (String(data.senderId).trim().toLowerCase() === studentId.trim().toLowerCase()) return;
      setLastActiveTime(Date.now());
      try {
        const bytes = CryptoJS.AES.decrypt(data.encryptedText, SECRET_KEY);
        const text = bytes.toString(CryptoJS.enc.Utf8);

        if (text.startsWith("SYS_CUSTOM_PING::")) {
            const alertMsg = text.substring("SYS_CUSTOM_PING::".length);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`New Alert from ${studentId.trim() === "UserA" ? "UserB" : "Partner"}`, { body: alertMsg });
                alert(`🔔 Alert from Partner:\n\n${alertMsg}`);
            } else {
                alert(`🔔 Alert from Partner:\n\n${alertMsg}`);
            }
            return;
        }

        if (text === "SYS_VID_OFF") { setIsRemoteVideoMuted(true); return; }
        if (text === "SYS_VID_ON") { setIsRemoteVideoMuted(false); return; }
        if (text === "SYS_MIC_OFF") { setIsRemoteMicMuted(true); return; }
        if (text === "SYS_MIC_ON") { setIsRemoteMicMuted(false); return; }

        // 🔥 MULTI-USER REACTION RECEIVE LOGIC
        if (text.startsWith("SYS_REACT::")) {
           const parts = text.split("::");
           const reactMsgId = parts[1];
           const emoji = parts[2];
           setMessages((prev) => prev.map((m) => {
             if (m.id == reactMsgId || m._id == reactMsgId) {
                const newReactions = { ...(m.reactions || {}) };
                if (emoji) newReactions.them = emoji;
                else delete newReactions.them;
                return { ...m, reactions: newReactions };
             }
             return m;
           }));
           return;
        }

        if (text.startsWith("SYS_VID_FILTER::")) {
          setRemoteFilter(parseInt(text.split("::")[1], 10));
          return;
        }

        if (text.startsWith("SYS_DRAW::")) {
          const parts = text.split("::")[1].split(",");
          window.dispatchEvent(new CustomEvent("peer-draw", {
            detail: {
              x0: parseFloat(parts[0]),
              y0: parseFloat(parts[1]),
              x1: parseFloat(parts[2]),
              y1: parseFloat(parts[3]),
              color: parts[4]
            }
          }));
          return;
        }

        if (text === "SYS_CLEAR_CANVAS") {
           window.dispatchEvent(new Event("peer-clear"));
           return;
        }

        if (text === "SYS_PING_ACTIVE" || text === "SYS_NODE_CONNECTED") {
          setIsPeerActive(true);
          clearTimeout(peerTimeout.current);
          peerTimeout.current = setTimeout(() => setIsPeerActive(false), 7000);
          if (text === "SYS_NODE_CONNECTED") sendPresencePing();
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

    pusher.connection.bind("connected", () => {
      sendHello();
      setTimeout(sendHello, 500);
    });

    const pingInterval = setInterval(sendPresencePing, 3000);

    return () => { clearInterval(pingInterval); clearTimeout(peerTimeout.current); clearTimeout(typingTimeout.current); pusher.unsubscribe(activeChannel); pusher.disconnect(); };
  }, [appState, currentUser, activeChannel, studentId]);

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

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("⚠️ File is too large! Please select a video/image under 15MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        const delToken = data.delete_token || "no_token";
        const prefix = file.type.startsWith("video/") ? "VID_SYS" : "IMG_SYS";
        await dispatchMessage(`${prefix}::${data.secure_url}::${delToken}`);
      } else {
        alert("Upload failed. " + (data.error?.message || "Please try again."));
      }
    } catch (err) {
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const startRecording = () => {
    const stream = snapVideoRef.current?.srcObject;
    if (!stream) return;
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        await handleSnapVideoUpload(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Video recording not supported on this browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handlePointerDown = () => {
    if (isSnapping || isUploading) return;
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      startRecording();
    }, 300);
  };

  const handlePointerUp = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (isLongPressRef.current) {
      stopRecording();
    } else {
      handleSnapCapture();
    }
  };

  const handleSnapVideoUpload = async (blob) => {
    setIsSnapping(true);
    const file = new File([blob], `snap_vid_${Date.now()}.webm`, { type: "video/webm" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        const delToken = data.delete_token || "no_token";
        await dispatchMessage(`VID_SYS::${data.secure_url}::${delToken}`);
        setAppState("CHAT");
      } else {
        alert("Video upload failed.");
      }
    } catch (error) {
      alert("Network error sending video.");
    } finally {
      setIsSnapping(false);
      setIsRecording(false);
    }
  };

  const handleSnapCapture = async () => {
    if (!snapVideoRef.current || isSnapping) return;
    setIsSnapping(true);

    const video = snapVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.filter = SNAP_FILTERS[snapFilterIndex].filter;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) { setIsSnapping(false); return; }

      const file = new File([blob], `snap_${Date.now()}.jpg`, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.secure_url) {
          const delToken = data.delete_token || "no_token";
          await dispatchMessage(`IMG_SYS::${data.secure_url}::${delToken}`);
          setAppState("CHAT");
        } else {
          alert("Snap upload failed.");
        }
      } catch (error) {
        alert("Network error sending snap.");
      } finally {
        setIsSnapping(false);
      }
    }, "image/jpeg", 0.9);
  };

  const handlePingPartner = async () => {
    setIsPinging(true);
    try {
      const res = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: studentId.trim(), receiver: targetNode, channel: activeChannel }),
      });

      const data = await res.json();
      if (!data.success) alert("❌ Ping Failed: " + data.error);
      setTimeout(() => setIsPinging(false), 3000);
    } catch (error) {
      setIsPinging(false);
    }
  };

  const bgPatternDark = `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233f3f46' fill-opacity='0.2' font-family='sans-serif'%3E%3Ctext x='20' y='30' font-size='16'%3E%F0%9F%98%BA%3C/text%3E%3Ctext x='80' y='80' font-size='12'%3E%E2%99%A1%3C/text%3E%3Ctext x='140' y='40' font-size='14'%3E%E2%98%86%3C/text%3E%3Ctext x='30' y='120' font-size='16'%3E%E2%98%BA%3C/text%3E%3Ctext x='110' y='150' font-size='12'%3E%E2%9C%A8%3C/text%3E%3Ctext x='160' y='110' font-size='14'%3E%E2%99%A1%3C/text%3E%3Ctext x='80' y='10' font-size='10'%3E%E2%98%BA%3C/text%3E%3Ctext x='10' y='80' font-size='10'%3E%E2%9C%A8%3C/text%3E%3C/g%3E%3C/svg%3E")`;
  const bgPatternLight = `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d0d5df' fill-opacity='0.4' font-family='sans-serif'%3E%3Ctext x='20' y='30' font-size='16'%3E%F0%9F%98%BA%3C/text%3E%3Ctext x='80' y='80' font-size='12'%3E%E2%99%A1%3C/text%3E%3Ctext x='140' y='40' font-size='14'%3E%E2%98%86%3C/text%3E%3Ctext x='30' y='120' font-size='16'%3E%E2%98%BA%3C/text%3E%3Ctext x='110' y='150' font-size='12'%3E%E2%9C%A8%3C/text%3E%3Ctext x='160' y='110' font-size='14'%3E%E2%99%A1%3C/text%3E%3Ctext x='80' y='10' font-size='10'%3E%E2%98%BA%3C/text%3E%3Ctext x='10' y='80' font-size='10'%3E%E2%9C%A8%3C/text%3E%3C/g%3E%3C/svg%3E")`;
  const bgPatternLove = `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e11d48' fill-opacity='0.1' font-family='sans-serif'%3E%3Ctext x='20' y='30' font-size='20'%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3Ctext x='80' y='80' font-size='16'%3E%F0%9F%92%96%3C/text%3E%3Ctext x='140' y='40' font-size='20'%3E%F0%9F%A5%80%3C/text%3E%3Ctext x='30' y='120' font-size='16'%3E%F0%9F%92%8B%3C/text%3E%3Ctext x='110' y='150' font-size='20'%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3Ctext x='160' y='110' font-size='16'%3E%F0%9F%8C%B9%3C/text%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <>
      <audio
        ref={(node) => {
          if (node && remoteStream && node.srcObject !== remoteStream) {
            node.srcObject = remoteStream;
          }
        }}
        autoPlay
        playsInline
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />

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

        {appState === "MODE_SELECTION" && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 z-50 overflow-y-auto custom-scrollbar ${isDarkMode ? "bg-[#09090b] text-slate-200" : "bg-slate-50 text-slate-800"}`}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[100px] rounded-full" />
            </div>

            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 mt-12 text-center z-10">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg border ${isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-white border-slate-200"}`}>
                 <Aperture className={isDarkMode ? "text-blue-400" : "text-blue-600"} size={32} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Select Interface</h2>
              <p className="text-slate-500 mt-2 text-sm">Choose your communication module</p>
            </motion.div>

            <div className="w-full max-w-sm space-y-4 z-10 mb-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppState("CHAT")}
                className={`w-full flex items-center justify-between p-5 backdrop-blur-xl border rounded-2xl transition-all group shadow-xl ${isDarkMode ? "bg-[#18181b]/80 border-[#27272a] hover:border-blue-500/50" : "bg-white border-slate-200 hover:border-blue-500/50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <MessageSquare className="text-blue-500" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Secure Chat</h3>
                    <p className="text-slate-500 text-xs">Encrypted text & media relay</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-blue-500 transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppState("SNAP_MODE")}
                className={`w-full flex items-center justify-between p-5 backdrop-blur-xl border rounded-2xl transition-all group shadow-xl ${isDarkMode ? "bg-[#18181b]/80 border-[#27272a] hover:border-purple-500/50" : "bg-white border-slate-200 hover:border-purple-500/50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Camera className="text-purple-500" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Snap Module</h3>
                    <p className="text-slate-500 text-xs">Volatile visual transmission</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-purple-500 transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppState("SCRIBBLE_MODE")}
                className={`w-full flex items-center justify-between p-5 backdrop-blur-xl border rounded-2xl transition-all group shadow-xl ${isDarkMode ? "bg-[#18181b]/80 border-[#27272a] hover:border-green-500/50" : "bg-white border-slate-200 hover:border-green-500/50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <Palette className="text-green-500" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Scribble Game</h3>
                    <p className="text-slate-500 text-xs">Live drawing & guessing</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-green-500 transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppState("CUSTOM_PING")}
                className={`w-full flex items-center justify-between p-5 backdrop-blur-xl border rounded-2xl transition-all group shadow-xl ${isDarkMode ? "bg-[#18181b]/80 border-[#27272a] hover:border-amber-500/50" : "bg-white border-slate-200 hover:border-amber-500/50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <BellRing className="text-amber-500" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Custom Alert</h3>
                    <p className="text-slate-500 text-xs">Send targeted notifications</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-500 group-hover:text-amber-500 transition-colors" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {appState === "CUSTOM_PING" && (
          <CustomPing
            setAppState={setAppState}
            studentId={studentId}
            targetNode={targetNode}
            activeChannel={activeChannel}
            isDarkMode={isDarkMode}
            isLoveMode={isLoveMode}
          />
        )}

        {appState === "SNAP_MODE" && (
          <motion.div
            key="snap-mode"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 w-full h-[100dvh] bg-black z-[100] flex flex-col overflow-hidden select-none"
          >
            <video
              ref={snapVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-105 transform -scale-x-100 transition-all duration-300"
              style={{ filter: SNAP_FILTERS[snapFilterIndex].filter }}
            />

            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-20">
               <button onClick={() => setAppState("CHAT")} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform">
                  <X size={24} />
               </button>
               <div className="text-white font-semibold text-xs tracking-[0.2em] uppercase drop-shadow-md">
                  {SNAP_FILTERS[snapFilterIndex].name}
               </div>
               <div className="w-10"></div>
            </div>

            <div className="absolute inset-0 z-10 flex">
              <div
                className="w-1/2 h-full flex items-center justify-start p-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setSnapFilterIndex(prev => (prev - 1 + SNAP_FILTERS.length) % SNAP_FILTERS.length)}
              >
                 <ChevronLeft className="text-white drop-shadow-lg" size={48} />
              </div>
              <div
                className="w-1/2 h-full flex items-center justify-end p-4 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setSnapFilterIndex(prev => (prev + 1) % SNAP_FILTERS.length)}
              >
                 <ChevronRight className="text-white drop-shadow-lg" size={48} />
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 pb-12 pt-20 flex flex-col items-center bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
               <div className="text-white/80 text-xs tracking-widest uppercase mb-6 font-medium drop-shadow-md pointer-events-none">
                  Tap for Photo • Hold for Video
               </div>

               <button
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ touchAction: 'none' }}
                  disabled={isSnapping && !isRecording}
                  className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 pointer-events-auto select-none ${isRecording ? 'border-rose-500 scale-[1.15]' : 'border-white/80 active:scale-90'}`}
               >
                  {isSnapping && !isRecording ? (
                    <Loader2 className="text-white animate-spin" size={32} />
                  ) : (
                    <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-rose-500 rounded-md' : 'w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]'}`}></div>
                  )}
               </button>
            </div>
          </motion.div>
        )}

       {appState === "SCRIBBLE_MODE" && (
          <ScribbleBoard
            setAppState={setAppState}
            studentId={studentId}
            targetNode={targetNode}
            isPeerActive={isPeerActive}
            callState={callState}
            startCall={startCall}
            toggleMic={toggleMic}
            localStream={localStream}
            isMicMuted={isMicMuted}
            sendDrawEvent={sendDrawEvent}
            sendClearEvent={sendClearEvent}
            answerCall={answerCall}   
            endCall={endCall}         
          />
        )}

        {appState === "CHAT" && (
          <motion.div
            ref={chatWrapperRef}
            key="chat"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute left-0 w-full font-sans flex flex-col overflow-hidden z-50 ${isDarkMode || isLoveMode ? "text-slate-200" : "text-slate-800"}`}
            style={{
              top: 0,
              height: '100%',
              backgroundColor: isLoveMode ? '#050002' : (isDarkMode ? '#09090b' : '#f4f5f9'),
              backgroundImage: isLoveMode ? 'radial-gradient(circle at center, #2e0510 0%, #050002 100%)' : 'none'
            }}
          >
            <input type="file" accept="image/*,video/*" capture="camera" ref={cameraInputRef} className="hidden" onChange={handleMediaUpload} />
            <input type="file" accept="image/*,video/*" ref={galleryInputRef} className="hidden" onChange={handleMediaUpload} />

            <ChatHeader targetNode={targetNode} isPeerActive={isPeerActive} lastActiveTime={lastActiveTime} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} isLoveMode={isLoveMode} setIsLoveMode={setIsLoveMode} startCall={startCall} callState={callState} handlePingPartner={handlePingPartner} isPinging={isPinging} handleLogout={handleLogout} />

            <MessageList messages={messages} isDarkMode={isDarkMode} isLoveMode={isLoveMode} expandedImage={expandedImage} setExpandedImage={setExpandedImage} isPeerActive={isPeerActive} isPeerTyping={isPeerTyping} chatContainerRef={chatContainerRef} bgPatternDark={bgPatternDark} bgPatternLight={bgPatternLight} bgPatternLove={bgPatternLove} setReplyTo={setReplyTo} handleReaction={handleReaction} />

            <MessageInput
              inputRef={inputRef}
              input={input}
              setInput={setInput}
              handleTextSubmit={handleTextSubmit}
              handleInputChange={handleInputChange}
              isUploading={isUploading}
              showEmojis={showEmojis}
              setShowEmojis={setShowEmojis}
              cameraInputRef={cameraInputRef}
              galleryInputRef={galleryInputRef}
              isDarkMode={isDarkMode}
              isLoveMode={isLoveMode}
              ignorePanicRef={ignorePanicRef}
              scrollToBottom={scrollToBottom}
              dispatchMessage={dispatchMessage}
              setAppState={setAppState}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
            />

            <CallOverlay
              callState={callState}
              isVideoCall={isVideoCall}
              localStream={localStream}
              remoteStream={remoteStream}
              answerCall={answerCall}
              rejectCall={rejectCall}
              endCall={endCall}
              isMicMuted={isMicMuted}
              isVideoMuted={isVideoMuted}
              toggleMic={toggleMic}
              toggleVideo={toggleVideo}
              isRemoteVideoMuted={isRemoteVideoMuted}
              isRemoteMicMuted={isRemoteMicMuted} 
              isCallMinimized={isCallMinimized}
              setIsCallMinimized={setIsCallMinimized}
              SNAP_FILTERS={SNAP_FILTERS}
              localFilter={localFilter}
              setLocalFilter={(newFilterIndex) => {
                 setLocalFilter(newFilterIndex);
                 const pingText = CryptoJS.AES.encrypt(`SYS_VID_FILTER::${newFilterIndex}`, SECRET_KEY).toString();
                 fetch("/api/pusher", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Date.now(), encryptedText: pingText, senderId: studentId.trim(), channel: activeChannel }) }).catch(() => {});
              }}
              remoteFilter={remoteFilter}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}