"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";

// --- Import the separated components ---
import DecoyNav from "./DecoyNav";
import DecoySearchBar from "./DecoySearchBar";
import DecoyMainContent from "./DecoyMainContent";
import DecoyFooter from "./DecoyFooter";
import DecoyModal from "./DecoyModal";

export default function ModernDecoy({ onTrigger }) {
  // === CORE STATES ===
  const [query, setQuery] = useState("");
  const [studyData, setStudyData] = useState([]);
  const [triggerWord, setTriggerWord] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ---> NEW: Dark Mode State <---
  const [isDarkMode, setIsDarkMode] = useState(true);

  // === CONTACT FORM STATE ===
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchContent();
      fetchSettings();
      trackEvent("VIEW_TAB", "home"); 
      hasInitialized.current = true;
    }
  }, []);

  // --- API & HANDLERS ---
  const trackEvent = async (actionType, details = "") => {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType, details })
      });
    } catch(e) {}
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    trackEvent("VIEW_TAB", tabId);
    setIsMobileMenuOpen(false); 
  };

  const fetchContent = async () => {
    const res = await fetch("/api/admin/content");
    const data = await res.json();
    if (data.success) setStudyData(data.items);
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (data.success) setTriggerWord(data.triggerWord);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    trackEvent("SEARCH", query); 

    const activeTrigger = triggerWord ? triggerWord.trim().toUpperCase() : "TOUR-404-LIVE";
    const userQuery = query.trim().toUpperCase();

    if (userQuery === activeTrigger) {
      setQuery(""); 
      onTrigger(); 
    } else {
      alert("Searching global archives for: " + query);
      setQuery(""); 
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      alert('Enquiry submitted successfully.'); 
      setContactForm({ name: "", email: "", message: "" });
    } catch(err) {
      alert("Error sending message.");
    }
    setIsSending(false);
  };

  const openReport = (item) => {
    setSelectedReport(item);
    trackEvent("VIEW_REPORT", item.title); 
  };

  const getFilteredData = () => {
    if (activeTab === "home") return studyData.slice(0, 3);
    if (activeTab === "research") return studyData.filter(item => item.category?.toLowerCase().includes("research") || item.category?.toLowerCase().includes("journal"));
    if (activeTab === "courses") return studyData.filter(item => item.category?.toLowerCase().includes("course") || item.category?.toLowerCase().includes("module"));
    if (activeTab === "library") return studyData.filter(item => item.category?.toLowerCase().includes("library") || item.category?.toLowerCase().includes("book"));
    return studyData;
  };

  const filteredData = getFilteredData();

  return (
    // ---> NEW: Master Dark Mode Wrapper <---
    <div className={`${isDarkMode ? "dark" : ""} w-full h-full`}>
      <div className="min-h-screen bg-[#fafbfc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500">
        
        <DecoyNav 
          activeTab={activeTab} 
          handleTabChange={handleTabChange} 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode} 
        />

        <DecoySearchBar 
          query={query} 
          setQuery={setQuery} 
          handleSearch={handleSearch} 
        />

        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <DecoyMainContent 
              key={activeTab} 
              activeTab={activeTab} 
              handleTabChange={handleTabChange} 
              filteredData={filteredData} 
              openReport={openReport} 
            />
          </AnimatePresence>
        </main>

        <DecoyFooter 
          contactForm={contactForm} 
          setContactForm={setContactForm} 
          isSending={isSending} 
          handleContactSubmit={handleContactSubmit} 
        />

        <DecoyModal 
          selectedReport={selectedReport} 
          setSelectedReport={setSelectedReport} 
        />

      </div>
    </div>
  );
}