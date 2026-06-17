"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORY_ICONS,
  TOOL_ICONS,
  ICON_SIZES,
} from "@/lib/icons";

// ─── Data ────────────────────────────────────────────────────────────────────

const INVESTIGATOR_CATEGORIES = [
  {
    id: "collaboration",
    icon: CATEGORY_ICONS["Collaboration & AI"],
    label: "Collaboration & AI",
    accentColor: "#3b82f6",
    accentBg: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.3)",
    tools: [
      { name: "Saral AI",          hindi: "सरल एआई",           live: true  },
      { name: "iC Connect",        hindi: "आईसी कनेक्ट",        live: false },
      { name: "Tip Line Analysis", hindi: "टिप लाइन एनालिसिस", live: false },
    ],
  },
  {
    id: "mobile",
    icon: CATEGORY_ICONS["Mobile & Device Intelligence"],
    label: "Mobile & Device Intelligence",
    accentColor: "#6366f1",
    accentBg: "rgba(99,102,241,0.08)",
    accentBorder: "rgba(99,102,241,0.3)",
    tools: [
      { name: "CDR Processor",   hindi: "सीडीआर प्रोसेसर",      live: false },
      { name: "IMEI Lookup",     hindi: "आईएमईआई लुकअप",        live: false },
      { name: "CEIR Tracer",     hindi: "सीईआईआर ट्रेसर",       live: false },
      { name: "Cell Spyder",     hindi: "सेल स्पाइडर",          live: false },
      { name: "MNI Analysis",    hindi: "एमएनआई एनालिसिस",      live: false },
      { name: "TSP Lookup",      hindi: "टीएसपी लुकअप",         live: false },
      { name: "MCC-MNC Lookup",  hindi: "एमसीसी-एमएनसी लुकअप", live: false },
      { name: "MAC Lookup",      hindi: "मैक लुकअप",            live: false },
      { name: "SMS Header Intel",hindi: "एसएमएस हेडर इंटेल",    live: false },
    ],
  },
  {
    id: "financial",
    icon: CATEGORY_ICONS["Financial Investigation"],
    label: "Financial Investigation",
    accentColor: "#10b981",
    accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.3)",
    tools: [
      { name: "BSA",             hindi: "बीएसए",               live: false },
      { name: "PhonePe Analyzer",hindi: "फोनपे एनालाइज़र",     live: false },
      { name: "NCCRP Graph",     hindi: "एनसीसीआरपी ग्राफ",    live: false },
      { name: "TSDP",            hindi: "टीएसडीपी",            live: false },
      { name: "ATM Lookup",      hindi: "एटीएम लुकअप",         live: false },
      { name: "IFSC Lookup",     hindi: "आईएफएससी लुकअप",      live: false },
    ],
  },
  {
    id: "location",
    icon: CATEGORY_ICONS["Location & Movement"],
    label: "Location & Movement",
    accentColor: "#f59e0b",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.3)",
    tools: [
      { name: "Geolocation Tracking", hindi: "जियोलोकेशन ट्रैकिंग", live: true  },
      { name: "Lat Long Mapper",      hindi: "लैट लॉन्ग मैपर",       live: false },
      { name: "Sugam Route",          hindi: "सुगम रूट",             live: false },
      { name: "Toll Plaza",           hindi: "टोल प्लाज़ा",           live: false },
      { name: "IPDR Analysis",        hindi: "आईपीडीआर एनालिसिस",    live: false },
      { name: "Google Analyzer",      hindi: "गूगल एनालाइज़र",       live: false },
    ],
  },
  {
    id: "identity",
    icon: CATEGORY_ICONS["Identity & Verification"],
    label: "Identity & Verification",
    accentColor: "#ec4899",
    accentBg: "rgba(236,72,153,0.08)",
    accentBorder: "rgba(236,72,153,0.3)",
    tools: [
      { name: "Aadhaar Validator", hindi: "आधार वैलिडेटर",    live: false },
      { name: "CAF Summarizer",    hindi: "सीएएफ समराइज़र",    live: false },
      { name: "IP Intelligence",   hindi: "आईपी इंटेलिजेंस",  live: false },
      { name: "Hash Generator",    hindi: "हैश जेनरेटर",      live: false },
    ],
  },
  {
    id: "database",
    icon: CATEGORY_ICONS["Database & Directory"],
    label: "Database & Directory",
    accentColor: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.08)",
    accentBorder: "rgba(139,92,246,0.3)",
    tools: [
      { name: "PS Lookup",      hindi: "पीएस लुकअप",      live: false },
      { name: "Nodal Officers", hindi: "नोडल ऑफिसर्स",    live: false },
      { name: "LEA Templates",  hindi: "एलईए टेम्पलेट्स", live: false },
    ],
  },
];

const CORPORATE_CATEGORIES = [
  {
    id: "corporate",
    icon: CATEGORY_ICONS["Corporate Security"],
    label: "Corporate Security",
    accentColor: "#a78bfa",
    accentBg: "rgba(167,139,250,0.08)",
    accentBorder: "rgba(167,139,250,0.3)",
    tools: [
      { name: "Email Security", hindi: "ईमेल सिक्योरिटी", live: false },
    ],
  },
];

const FEATURED_MODULES = [
  {
    icon: TOOL_ICONS["Saral AI"],
    name: "Saral AI",
    hindi: "सरल एआई",
    tagline: "AI-Powered Investigation Intelligence",
    desc: "Simulate expert consultations with AI specialists — forensic analysts, legal advisors, interrogators. Build structured case timelines, analyse evidence, and generate investigation summaries. Saral AI brings a full expert panel to every case, available instantly.",
    accentColor: "#3b82f6",
    accentBg: "rgba(59,130,246,0.06)",
    accentBorder: "rgba(59,130,246,0.25)",
  },
  {
    icon: TOOL_ICONS["Geolocation Tracking"],
    name: "Geolocation Tracking",
    hindi: "जियोलोकेशन ट्रैकिंग",
    tagline: "Real-Time Suspect Tracking & Radar",
    desc: "Deploy precision geolocation bait links to capture a suspect's exact location the moment they're triggered. The radar dashboard logs each hit with device intelligence, IP data, and timestamps — building a location history with every interaction.",
    accentColor: "#10b981",
    accentBg: "rgba(16,185,129,0.06)",
    accentBorder: "rgba(16,185,129,0.25)",
  },
];

const totalTools = INVESTIGATOR_CATEGORIES.reduce((a, c) => a + c.tools.length, 0)
  + CORPORATE_CATEGORIES.reduce((a, c) => a + c.tools.length, 0);
const liveTools = INVESTIGATOR_CATEGORIES.reduce((a, c) => a + c.tools.filter(t => t.live).length, 0)
  + CORPORATE_CATEGORIES.reduce((a, c) => a + c.tools.filter(t => t.live).length, 0);

// ─── Chevron helper ───────────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Category card (expandable, lives inside accordion) ───────────────────────

function CategoryCard({ cat }) {
  const [open, setOpen] = useState(false);
  const liveCount = cat.tools.filter(t => t.live).length;
  const CategoryIcon = cat.icon;
  return (
    <div style={{
      background: "var(--bg3)",
      border: `0.5px solid var(--border)`,
      borderLeft: `2px solid ${cat.accentBorder}`,
      borderRadius: "8px",
      overflow: "hidden",
      transition: "border-color 0.15s",
    }}>
      {/* Card header — clickable */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px",
          cursor: "pointer",
          userSelect: "none",
          background: open ? cat.accentBg : "transparent",
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CategoryIcon
            size={ICON_SIZES.category}
            color={cat.accentColor}
            strokeWidth={2}
          />
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>
              {cat.label}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "1px" }}>
              {cat.tools.length} tools
              {liveCount > 0 && (
                <span style={{ color: "#10b981", marginLeft: "4px" }}>· {liveCount} live</span>
              )}
            </div>
          </div>
        </div>
        <Chevron open={open} />
      </div>

      {/* Tool list */}
      {open && (
        <div style={{
          borderTop: `0.5px solid var(--border)`,
          padding: "8px 12px 10px",
        }}>
          {cat.tools.map(tool => (
            <div key={tool.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "0.5px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: cat.accentColor, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: "11px", color: "var(--text2)" }}>{tool.name}</span>
                <span style={{ fontSize: "10px", color: "var(--text3)", fontFamily: "var(--font-devanagari)" }}>{tool.hindi}</span>
              </div>
              {tool.live && (
                <span style={{
                  fontSize: "9px", fontWeight: 600, padding: "1px 5px",
                  borderRadius: "4px", background: "rgba(16,185,129,0.1)",
                  color: "#10b981", border: "0.5px solid rgba(16,185,129,0.2)",
                  flexShrink: 0, marginLeft: "6px",
                }}>Live</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Capabilities Panel ───────────────────────────────────────────────────────

function CapabilitiesPanel() {
  const [investigatorOpen, setInvestigatorOpen] = useState(true);
  const [corporateOpen, setCorporateOpen] = useState(false);

  // Subtle dot-grid texture via SVG data URI — works in both light/dark themes
  const dotGrid = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23ffffff' stroke-opacity='0.06' stroke-width='0.5'/%3E%3C/svg%3E")`;
  return (
    <div style={{
      width: "42%",
      height: "100%",
      background: `var(--bg2)`,
      backgroundImage: dotGrid,
      borderRight: "0.5px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "40px 32px 24px",
      boxSizing: "border-box",
      overflowY: "auto",
      position: "relative",
    }}>

      {/* Brand */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <img
            src="/saral-logo.png"
            alt="SaralTech"
            style={{ width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0 }}
          />
          <div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "17px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Cyber AI Agent
            </div>
            <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
              by SaralTech
            </div>
          </div>
        </div>
        
      </div>

      {/* Featured Modules */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "10px" }}>
          Featured Modules
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {FEATURED_MODULES.map(mod => (
            
            <div key={mod.name} style={{
              background: mod.accentBg,
              border: `0.5px solid ${mod.accentBorder}`,
              borderLeft: `2px solid ${mod.accentColor}`,
              borderRadius: "8px",
              padding: "14px 14px",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <mod.icon
                  size={ICON_SIZES.featured}
                  color={mod.accentColor}
                  strokeWidth={2}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{mod.name}</span>
                    <span style={{ fontSize: "10px", color: mod.accentColor, fontFamily: "var(--font-devanagari)" }}>{mod.hindi}</span>
                    <span style={{
                      fontSize: "9px", fontWeight: 600, padding: "1px 5px",
                      borderRadius: "4px", background: "rgba(16,185,129,0.12)",
                      color: "#10b981", border: "0.5px solid rgba(16,185,129,0.25)",
                      marginLeft: "auto", flexShrink: 0,
                    }}>Live</span>
                  </div>
                  <div style={{ fontSize: "10px", color: mod.accentColor, fontWeight: 600, marginTop: "1px", letterSpacing: "0.1px" }}>
                    {mod.tagline}
                  </div>
                </div>
              </div>
              {/* Description */}
              <div style={{ fontSize: "11px", color: "var(--text2)", lineHeight: 1.65, paddingLeft: "26px" }}>
                {mod.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "0.5px", background: "var(--border)", marginBottom: "20px" }} />

      {/* Accordions — For Investigators / For Corporates */}
      <div style={{ marginBottom: "8px" }}>

        {/* For Investigators */}
        <div style={{ marginBottom: "4px" }}>
          <div
            onClick={() => setInvestigatorOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 10px", borderRadius: "7px",
              cursor: "pointer", userSelect: "none",
              background: investigatorOpen ? "rgba(59,130,246,0.06)" : "transparent",
              border: "0.5px solid",
              borderColor: investigatorOpen ? "rgba(59,130,246,0.2)" : "var(--border)",
              transition: "all 0.15s",
              marginBottom: "6px",
            }}
          >
            <Chevron open={investigatorOpen} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: investigatorOpen ? "var(--text)" : "var(--text2)", flex: 1 }}>
              For Investigators
            </span>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "8px",
              background: "rgba(59,130,246,0.1)", color: "#3b82f6",
              border: "0.5px solid rgba(59,130,246,0.2)",
            }}>
              {INVESTIGATOR_CATEGORIES.reduce((a, c) => a + c.tools.length, 0)} tools
            </span>
          </div>

          {investigatorOpen && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingLeft: "4px", marginBottom: "8px" }}>
              {INVESTIGATOR_CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          )}
        </div>

        {/* For Corporates */}
        <div>
          <div
            onClick={() => setCorporateOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 10px", borderRadius: "7px",
              cursor: "pointer", userSelect: "none",
              background: corporateOpen ? "rgba(167,139,250,0.06)" : "transparent",
              border: "0.5px solid",
              borderColor: corporateOpen ? "rgba(167,139,250,0.2)" : "var(--border)",
              transition: "all 0.15s",
              marginBottom: "6px",
            }}
          >
            <Chevron open={corporateOpen} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: corporateOpen ? "var(--text)" : "var(--text2)", flex: 1 }}>
              For Corporates
            </span>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "8px",
              background: "rgba(167,139,250,0.1)", color: "#a78bfa",
              border: "0.5px solid rgba(167,139,250,0.2)",
            }}>
              {CORPORATE_CATEGORIES.reduce((a, c) => a + c.tools.length, 0)} tools
            </span>
          </div>

          {corporateOpen && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingLeft: "4px" }}>
              {CORPORATE_CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spacer pushes status to bottom */}
      <div style={{ flex: 1 }} />

      {/* Status line — pinned bottom-left */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        paddingTop: "16px",
        borderTop: "0.5px solid var(--border)",
        marginTop: "16px",
      }}>
        <span style={{ fontSize: "11px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          {liveTools} Live
        </span>
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>·</span>
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>
          ⏳ {totalTools - liveTools} In Development
        </span>
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>·</span>
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>
          {totalTools} Total
        </span>
      </div>

    </div>
  );
}

// ─── Login Form (unchanged) ───────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("saral-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div style={{
      width: "58%",
      height: "100%",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-dm)",
      padding: "24px",
      boxSizing: "border-box",
      overflowY: "auto",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img
            src="/saral-logo.png"
            alt="SaralTech"
            style={{ width: "56px", height: "56px", borderRadius: "8px", display: "block", margin: "0 auto 16px" }}
          />
          <h1 style={{
            fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: "700",
            color: "var(--text)", margin: "0 0 6px 0", letterSpacing: "-0.3px",
          }}>
            Cyber AI Agent
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "11px", margin: 0 }}>
            by SaralTech
          </p>
          
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg2)", border: "0.5px solid var(--border)",
          borderRadius: "12px", padding: "32px",
        }}>
          <h2 style={{
            fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: "600",
            color: "var(--text)", margin: "0 0 24px 0",
          }}>
            Sign in to continue
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text2)", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@saralgroups.com"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                style={{
                  width: "100%", padding: "10px 12px", background: "var(--bg3)",
                  border: "0.5px solid var(--border)", borderRadius: "8px",
                  color: "var(--text)", fontSize: "14px", fontFamily: "var(--font-dm)",
                  outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text2)", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                style={{
                  width: "100%", padding: "10px 12px", background: "var(--bg3)",
                  border: "0.5px solid var(--border)", borderRadius: "8px",
                  color: "var(--text)", fontSize: "14px", fontFamily: "var(--font-dm)",
                  outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 12px", background: "rgba(163,45,45,0.12)",
                border: "0.5px solid rgba(163,45,45,0.4)", borderRadius: "8px",
                color: "#e57373", fontSize: "13px",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              style={{
                width: "100%", padding: "11px",
                background: loading || !email || !password ? "var(--bg3)" : "var(--accent)",
                color: loading || !email || !password ? "var(--text3)" : "var(--accent-text)",
                border: "0.5px solid var(--border)", borderRadius: "8px",
                fontSize: "14px", fontWeight: "600", fontFamily: "var(--font-dm)",
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                transition: "background 0.15s, color 0.15s", marginTop: "4px",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p style={{
            fontSize: "12px", color: "var(--text3)", textAlign: "center",
            margin: "20px 0 0 0", lineHeight: "1.5",
          }}>
            Access restricted to authorised investigators only.
            <br />
            Contact your administrator to get an account.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

function LoginPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "var(--font-dm)" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <CapabilitiesPanel />
        <LoginForm />
      </div>
      <div style={{
        borderTop: "0.5px solid var(--border)", background: "var(--bg2)",
        padding: "12px 40px", display: "flex", alignItems: "center",
        justifyContent: "center", gap: "16px",
      }}>
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>Copyright © 2026 SGELITE PRIVATE LIMITED. All rights reserved.</span>
        <span style={{ fontSize: "11px", color: "var(--border)" }}>·</span>
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>Cyber AI Agent v1.0</span>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <LoginPage />
    </Suspense>
  );
}