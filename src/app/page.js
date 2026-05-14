"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const tools = [
  {
    category: "Collaboration & AI",
    id: "collaboration",
    items: [
      { name: "Saral AI", icon: "🧠", desc: "AI-powered investigation simulation platform with multi-character consultation and evidence analysis.", usecase: "Simulate expert consultations; interrogate suspects; analyse case evidence with AI specialists.", live: true, href: "/saral-ai/projects" },
      { name: "iC Connect", icon: "🔗", desc: "Platform for police officers to connect with training batch colleagues.", usecase: "Collaborate with peers from same training batch; share intelligence securely.", live: false },
      { name: "Tip Line Analysis", icon: "📊", desc: "Processes and analyzes tip files in bulk.", usecase: "Handle large volumes of public tips; identify actionable intelligence from community reporting.", live: false },
    ]
  },
  {
    category: "Mobile & Device Intelligence",
    id: "mobile",
    items: [
      { name: "CDR Processor", icon: "📡", desc: "Analyzes mobile Call Detail Records with pattern detection.", usecase: "Map call frequency, duration, and tower locations; identify frequent contacts.", live: false },
      { name: "IMEI Lookup", icon: "📱", desc: "Performs instant bulk IMEI number validation.", usecase: "Check device authenticity; identify if multiple SIMs used on same phone.", live: false },
      { name: "CEIR Tracer", icon: "🔍", desc: "Dashboard for tracking stolen/lost mobile phones via CEIR.", usecase: "Trace stolen devices; check if a phone is blacklisted.", live: false },
      { name: "Cell Spyder", icon: "📶", desc: "Decodes Cell IDs and displays sectors on a map.", usecase: "Pinpoint device location at time of call/SMS.", live: false },
      { name: "MNI Analysis", icon: "🔬", desc: "100-point mobile number investigation framework.", usecase: "Deep-dive into mobile number history, associations, and digital footprint.", live: false },
      { name: "TSP Lookup", icon: "📋", desc: "Bulk lookup of mobile carriers and circles.", usecase: "Identify telecom service provider for multiple numbers simultaneously.", live: false },
      { name: "MCC-MNC Lookup", icon: "🌐", desc: "Mobile Country Code and Network Code lookup worldwide.", usecase: "Determine mobile operator and country from IMSI/MNC codes.", live: false },
      { name: "MAC Lookup", icon: "💻", desc: "OUI vendor lookup and MAC address intelligence.", usecase: "Identify device manufacturer; link devices to suspects in network crimes.", live: false },
      { name: "SMS Header Intel", icon: "✉️", desc: "Decodes SMS sender headers to identify TSP, circle, and entity.", usecase: "Trace spoofed SMS origins; identify telecom service provider.", live: false },
    ]
  },
  {
    category: "Financial Investigation",
    id: "financial",
    items: [
      { name: "BSA", icon: "🏦", desc: "Analyzes bulk bank statements for financial patterns.", usecase: "Detect money trails, suspicious deposits/withdrawals, and layering in financial frauds.", live: false },
      { name: "PhonePe Analyzer", icon: "💳", desc: "Comprehensive analysis for PhonePe transaction data.", usecase: "Parse and analyze UPI transaction exports; trace peer-to-peer payments.", live: false },
      { name: "NCCRP Graph", icon: "📈", desc: "Visualizes transaction trails to track fraud amount flow.", usecase: "Map money movement across accounts; identify layering points.", live: false },
      { name: "TSDP", icon: "🧾", desc: "Parses transaction screenshot data.", usecase: "Extract structured data from payment screenshots for evidence documentation.", live: false },
      { name: "ATM Lookup", icon: "🏧", desc: "Searches ATM locations and banking channel details.", usecase: "Track cash withdrawal locations; identify ATM used in a transaction.", live: false },
      { name: "IFSC Lookup", icon: "🔢", desc: "Looks up bank IFSC codes and branch details.", usecase: "Verify bank branch authenticity; identify beneficiary banks in fraud transactions.", live: false },
    ]
  },
  {
    category: "Location & Movement",
    id: "location",
    items: [
      { name: "Geolocation Tracking", icon: "🎯", desc: "Advanced suspect tracking and live radar intelligence system.", usecase: "Real-time suspect geolocation tracking; radar-based monitoring.", live: false },
      { name: "Lat Long Mapper", icon: "🗺️", desc: "Interactive tool for visualizing coordinates on maps.", usecase: "Plot GPS coordinates from evidence; map crime scenes and suspect movements.", live: false },
      { name: "Sugam Route", icon: "🛣️", desc: "Advanced route analysis and mapping tool.", usecase: "Reconstruct suspect travel routes from tower location data or GPS points.", live: false },
      { name: "Toll Plaza", icon: "🚗", desc: "Reviews toll plaza crossings and movement references.", usecase: "Track vehicle movement on highways; corroborate alibis or identify escape routes.", live: false },
      { name: "IPDR Analysis", icon: "🌐", desc: "Analyzes IPDR files, decodes sessions, and enriches with IP intel.", usecase: "Investigate internet usage patterns; map subscriber sessions to IP addresses.", live: false },
      { name: "Google Analyzer", icon: "🔎", desc: "Analyzes Google data requests and exports.", usecase: "Parse Google location history, search logs, and account activity.", live: false },
    ]
  },
  {
    category: "Identity & Verification",
    id: "identity",
    items: [
      { name: "Aadhaar Validator", icon: "🪪", desc: "Validates Aadhaar numbers for authenticity and formatting.", usecase: "Verify victim/suspect Aadhaar numbers; detect fake IDs in fraud cases.", live: false },
      { name: "CAF Summarizer", icon: "📄", desc: "Summarizes Customer Application Forms (CAF).", usecase: "Extract key details from mobile connection forms; identify fake applications.", live: false },
      { name: "IP Intelligence", icon: "🛡️", desc: "Provides deep IP insights including Tor/VPN detection.", usecase: "Trace origin of cyber attacks; identify anonymized traffic; geolocate IPs.", live: false },
      { name: "Hash Generator", icon: "🔐", desc: "Generates file hash values with certification support.", usecase: "Create digital fingerprints of evidence files; ensure data integrity for court.", live: false },
    ]
  },
  {
    category: "Database & Directory",
    id: "database",
    items: [
      { name: "PS Lookup", icon: "🏛️", desc: "Pan-India police station database.", usecase: "Locate correct police station jurisdiction; file complaints or transfer case information.", live: false },
      { name: "Nodal Officers", icon: "👤", desc: "Comprehensive directory of nodal officers.", usecase: "Quickly contact correct nodal officer for CDR, bank records, or subscriber information.", live: false },
      { name: "LEA Templates", icon: "📝", desc: "Ready-to-use Law Enforcement Agency templates.", usecase: "Generate standardized requisitions, summons, or court requests.", live: false },
    ]
  },
];

const totalTools = tools.reduce((acc, cat) => acc + cat.items.length, 0);
const liveTools = tools.reduce((acc, cat) => acc + cat.items.filter(t => t.live).length, 0);

export default function Dashboard() {
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("collaboration");
  const categoryRefs = useRef({});
  const searchRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("saral-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Press / to focus search
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Scroll spy — update active category as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-100px 0px -60% 0px" }
    );
    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("saral-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const scrollToCategory = (id) => {
    const el = categoryRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategory(id);
    }
  };

  const filteredTools = tools.map(cat => ({
    ...cat,
    items: cat.items.filter(tool =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.desc.toLowerCase().includes(search.toLowerCase()) ||
      tool.usecase.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const isDark = theme === "dark";

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      fontFamily: "var(--font-dm)",
      color: "var(--text)"
    }}>

      {/* Top bar */}
      <div style={{
        borderBottom: "0.5px solid var(--border)",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        background: "var(--bg2)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "28px", height: "28px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px"
          }}>⚡</div>
          <span style={{
            fontFamily: "var(--font-syne)",
            fontSize: "15px", fontWeight: 700,
            color: "var(--text)", letterSpacing: "-0.3px"
          }}>Cyber AI Agent</span>
          <span style={{
            fontSize: "10px", color: "var(--text3)",
            background: "var(--bg3)", padding: "2px 8px",
            borderRadius: "10px", letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>Intelligence Platform</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools... (/)"
              style={{
                background: "var(--bg3)",
                border: "0.5px solid var(--border2)",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "12px",
                fontFamily: "var(--font-dm)",
                color: "var(--text)",
                outline: "none",
                width: "220px"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: "10px", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "var(--text3)", cursor: "pointer", fontSize: "14px"
                }}
              >×</button>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: "var(--bg3)",
              border: "0.5px solid var(--border2)",
              borderRadius: "8px", padding: "7px 12px",
              fontSize: "12px", color: "var(--text2)",
              cursor: "pointer", fontFamily: "var(--font-dm)",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 600, color: "white"
          }}>S</div>
        </div>
      </div>

      <div style={{ display: "flex" }}>

        {/* Sidebar */}
        <div style={{
          width: "220px",
          minHeight: "calc(100vh - 56px)",
          background: "var(--bg2)",
          borderRight: "0.5px solid var(--border)",
          padding: "20px 12px",
          position: "sticky",
          top: "56px",
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          flexShrink: 0
        }}>
          <div style={{
            fontSize: "10px", fontWeight: 600, color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: "1px",
            padding: "4px 8px 12px"
          }}>
            Categories
          </div>

          {tools.map(cat => {
            const liveCnt = cat.items.filter(t => t.live).length;
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  color: isActive ? "var(--text)" : "var(--text2)",
                  cursor: "pointer",
                  marginBottom: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isActive ? "var(--bg3)" : "transparent",
                  borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                  transition: "all 0.15s"
                }}
              >
                <span>{cat.category}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {liveCnt > 0 && (
                    <span style={{
                      fontSize: "10px", padding: "1px 5px",
                      borderRadius: "8px", background: "rgba(16,185,129,0.1)",
                      color: "#10b981", fontWeight: 600
                    }}>{liveCnt}</span>
                  )}
                  <span style={{ fontSize: "10px", color: "var(--text3)" }}>
                    {cat.items.length}
                  </span>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: "20px", padding: "0 8px" }}>
            <div style={{ height: "0.5px", background: "var(--border)", marginBottom: "12px" }} />
            <div style={{ fontSize: "11px", color: "var(--text3)", lineHeight: 1.6 }}>
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#10b981", fontWeight: 600 }}>{liveTools}</span> live
              </div>
              <div>
                <span style={{ color: "var(--text2)", fontWeight: 500 }}>{totalTools - liveTools}</span> in development
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>

          {/* Page header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{
              fontFamily: "var(--font-syne)",
              fontSize: "24px", fontWeight: 800,
              color: "var(--text)", letterSpacing: "-0.6px",
              marginBottom: "6px"
            }}>
              Intelligence Tools
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text2)" }}>
              {search
                ? `${filteredTools.reduce((a, c) => a + c.items.length, 0)} results for "${search}"`
                : `${totalTools} tools · ${liveTools} live · ${totalTools - liveTools} in development`
              }
            </p>
          </div>

          {/* No results */}
          {filteredTools.length === 0 && (
            <div style={{
              textAlign: "center", padding: "64px 0",
              color: "var(--text3)"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
              <div style={{ fontSize: "15px", color: "var(--text2)", marginBottom: "6px" }}>No tools found</div>
              <div style={{ fontSize: "13px" }}>Try a different search term</div>
            </div>
          )}

          {/* Tool categories */}
          {filteredTools.map(cat => (
            <div
              key={cat.id}
              id={cat.id}
              ref={el => categoryRefs.current[cat.id] = el}
              style={{ marginBottom: "40px" }}
            >
              {/* Category header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                marginBottom: "14px",
                position: "sticky", top: "56px",
                background: "var(--bg)",
                paddingTop: "8px", paddingBottom: "8px",
                zIndex: 5
              }}>
                <div style={{
                  fontSize: "11px", fontWeight: 600, color: "var(--text3)",
                  textTransform: "uppercase", letterSpacing: "1px",
                  whiteSpace: "nowrap"
                }}>
                  {cat.category}
                </div>
                <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
                <div style={{
                  fontSize: "11px", color: "var(--text3)",
                  background: "var(--bg2)", padding: "2px 8px",
                  borderRadius: "10px", border: "0.5px solid var(--border)",
                  whiteSpace: "nowrap"
                }}>
                  {cat.items.length} tools
                </div>
              </div>

              {/* Tool grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "12px"
              }}>
                {cat.items.map(tool => (
                  <div key={tool.name} style={{
                    background: "var(--bg2)",
                    border: tool.live
                      ? "0.5px solid rgba(16,185,129,0.25)"
                      : "0.5px solid var(--border)",
                    borderRadius: "12px", padding: "18px",
                    transition: "all 0.15s"
                  }}>
                    {/* Top row */}
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", marginBottom: "10px"
                    }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        background: tool.live ? "rgba(16,185,129,0.1)" : "var(--bg3)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "16px"
                      }}>
                        {tool.icon}
                      </div>
                      <span style={{
                        fontSize: "10px", fontWeight: 600,
                        padding: "3px 8px", borderRadius: "6px",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        background: tool.live ? "rgba(16,185,129,0.1)" : "var(--bg3)",
                        color: tool.live ? "#10b981" : "var(--text3)",
                        border: tool.live
                          ? "0.5px solid rgba(16,185,129,0.2)"
                          : "0.5px solid var(--border)"
                      }}>
                        {tool.live ? "Live" : "Soon"}
                      </span>
                    </div>

                    {/* Name */}
                    <div style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "14px", fontWeight: 600,
                      color: "var(--text)", marginBottom: "5px",
                      letterSpacing: "-0.2px"
                    }}>
                      {tool.name}
                    </div>

                    {/* Description */}
                    <div style={{
                      fontSize: "12px", color: "var(--text2)",
                      lineHeight: 1.6, marginBottom: "10px"
                    }}>
                      {tool.desc}
                    </div>

                    {/* Use case */}
                    <div style={{
                      fontSize: "11px", color: "var(--text3)",
                      lineHeight: 1.5, paddingTop: "10px",
                      borderTop: "0.5px solid var(--border)"
                    }}>
                      {tool.usecase}
                    </div>

                    {/* Action */}
                    <div style={{ marginTop: "12px" }}>
                      {tool.live ? (
                        <Link href={tool.href}>
                          <button style={{
                            fontSize: "12px", fontWeight: 500,
                            padding: "6px 14px", borderRadius: "6px",
                            border: "0.5px solid rgba(16,185,129,0.3)",
                            background: "rgba(16,185,129,0.08)",
                            color: "#10b981", cursor: "pointer",
                            fontFamily: "var(--font-dm)",
                            transition: "all 0.15s"
                          }}>
                            Launch →
                          </button>
                        </Link>
                      ) : (
                        <button style={{
                          fontSize: "12px", padding: "6px 14px",
                          borderRadius: "6px",
                          border: "0.5px solid var(--border)",
                          background: "transparent",
                          color: "var(--text3)", cursor: "default",
                          fontFamily: "var(--font-dm)"
                        }}>
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}