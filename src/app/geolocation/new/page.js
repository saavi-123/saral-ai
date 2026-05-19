"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSession() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [decoyUrl, setDecoyUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);

    const trackingId = Math.random().toString(36).substring(2, 8);

    const payload = {
      data: {
        name,
        notes,
        session_id: "GEO-" + Date.now(),
        tracking_link: `https://yt-shorts.pages.dev/${trackingId}`,
        decoy_url: decoyUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status1: "active",
        investigator_name: "Admin"
      }
    };

    const res = await fetch(
      process.env.NEXT_PUBLIC_STRAPI_URL + "/api/tracking-sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    setLoading(false);

    if (data.data) {
      router.push("/geolocation");
    } else {
      alert("Error creating session");
      console.log(data);
    }
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: 500, color: "var(--text3)",
    textTransform: "uppercase", letterSpacing: "0.8px",
    display: "block", marginBottom: "8px"
  };

  return (
    <div style={{ padding: "32px", maxWidth: "560px" }}>
      <Link href="/geolocation" style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Sessions
      </Link>

      <h1 style={{
        fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 700,
        letterSpacing: "-0.5px", color: "var(--text)", margin: "16px 0 4px"
      }}>
        New Tracking Session
      </h1>
      <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "32px" }}>
        Generate a tracking link to send to a suspect
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Session Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rajan Mehta — Case PRJ-004"
          />
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            rows="3"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional investigation notes..."
          />
        </div>

        <div>
          <label style={labelStyle}>Decoy URL</label>
          <input
            value={decoyUrl}
            onChange={e => setDecoyUrl(e.target.value)}
            placeholder="https://youtube.com/... (where suspect is redirected)"
          />
          <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "6px" }}>
            Leave blank to use a default YouTube video
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            onClick={handleCreate}
            disabled={!name || loading}
            style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, cursor: "pointer",
              opacity: !name || loading ? 0.5 : 1
            }}
          >
            {loading ? "Creating..." : "Create Session"}
          </button>
          <Link href="/geolocation">
            <button style={{
              background: "transparent", border: "0.5px solid var(--border2)",
              borderRadius: "8px", padding: "10px 24px",
              fontSize: "14px", color: "var(--text2)", cursor: "pointer"
            }}>
              Cancel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}