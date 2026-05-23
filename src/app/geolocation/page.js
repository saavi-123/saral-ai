"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GeolocationDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
    const deleteSession = async (documentId) => {
      if (!confirm("Delete this session and all captured events?")) return;
      await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tracking-sessions/${documentId}`,
        { method: "DELETE" }
      );
      setSessions(prev => prev.filter(s => s.documentId !== documentId));
    };
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_STRAPI_URL + "/api/tracking-sessions?sort=createdAt:desc")
      .then(res => res.json())
      .then(data => {
        setSessions(data.data || []);
        setLoading(false);
      });
  }, []);

  const copyLink = (trackingLink) => {
    navigator.clipboard.writeText(trackingLink);
    alert("Tracking link copied!");
  };

  return (
    <div style={{ padding: "32px" }}>
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: "28px"
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-syne)", fontSize: "22px",
            fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)"
          }}>
            Geolocation Tracking
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
            {sessions.length} sessions
          </p>
        </div>
        <Link href="/geolocation/new">
          <button style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "9px 18px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500, cursor: "pointer"
          }}>
            + New Session
          </button>
        </Link>
      </div>

      {loading ? (
        <div style={{ color: "var(--text3)", fontSize: "14px" }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎯</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No sessions yet
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>
            Create a tracking session to generate a link
          </div>
          <Link href="/geolocation/new">
            <button style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, cursor: "pointer"
            }}>
              Create First Session
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sessions.map(session => (
            <div key={session.id} style={{
              border: "0.5px solid var(--border)", borderRadius: "12px",
              padding: "16px 20px", background: "var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: session.status1 === "active" ? "#E1F5EE" : "var(--bg3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px"
                }}>
                  🎯
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                    {session.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                    {session.session_id} · {new Date(session.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                  fontWeight: 500,
                  background: session.status1 === "active" ? "#E1F5EE" : "var(--bg3)",
                  color: session.status1 === "active" ? "#0F6E56" : "var(--text2)"
                }}>
                  {session.status1}
                </span>
                <button
                  onClick={() => copyLink(session.tracking_link)}
                  style={{
                    background: "transparent", border: "0.5px solid var(--border2)",
                    borderRadius: "8px", padding: "7px 14px",
                    fontSize: "12px", color: "var(--text2)", cursor: "pointer"
                  }}
                >
                  📋 Copy Link
                </button>
                <Link href={`/geolocation/${session.documentId}`}>
                  <button style={{
                    background: "transparent", border: "0.5px solid var(--border2)",
                    borderRadius: "8px", padding: "7px 14px",
                    fontSize: "12px", color: "var(--text2)", cursor: "pointer"
                  }}>
                    View →
                  </button>
                </Link>
                <button
                  onClick={() => deleteSession(session.documentId)}
                  style={{
                    background: "transparent", border: "0.5px solid #F09595",
                    borderRadius: "8px", padding: "7px 14px",
                    fontSize: "12px", color: "#A32D2D", cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}