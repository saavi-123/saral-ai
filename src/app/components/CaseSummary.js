"use client";

import { useState } from "react";

export default function CaseSummary({ project, characters, contextItems, projectId }) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateSummary = async () => {
    setLoading(true);

    // Fetch recent messages across all threads for this project
    let messages = [];
    try {
      const threadsRes = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads?filters[project][documentId][$eq]=${projectId}&pagination[pageSize]=100`
      );
      const threadsData = await threadsRes.json();
      const threads = threadsData.data || [];

      if (threads.length > 0) {
        const messagesRes = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/messages?filters[chat_thread][documentId][$in]=${threads.map(t => t.documentId).join(",")}&populate=character&sort=createdAt:desc&pagination[pageSize]=30`
        );
        const messagesData = await messagesRes.json();
        messages = messagesData.data || [];
      }
    } catch (e) {
      console.error("Could not fetch messages:", e);
    }

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, characters, contextItems, messages })
    });

    const data = await res.json();
    setSummary(data.summary || "Could not generate summary.");
    setGenerated(true);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    if (!generated) generateSummary();
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        style={{
          background: "transparent", border: "0.5px solid var(--border2)",
          borderRadius: "8px", padding: "9px 18px",
          fontSize: "13px", color: "var(--text2)", cursor: "pointer"
        }}
      >
        📋 Summary
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)", zIndex: 100
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "var(--bg)", border: "0.5px solid var(--border)",
        borderRadius: "16px", padding: "28px",
        width: "min(680px, 90vw)", zIndex: 101,
        maxHeight: "85vh", overflowY: "auto"
      }}>
        {/* Modal header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "20px"
        }}>
          <div>
            <h2 style={{
              fontSize: "18px", fontWeight: 700,
              color: "var(--text)", letterSpacing: "-0.4px"
            }}>
              Case Summary
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
              {project.name} · AI-generated
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {generated && (
              <button
                onClick={generateSummary}
                disabled={loading}
                style={{
                  background: "transparent", border: "0.5px solid var(--border2)",
                  borderRadius: "8px", padding: "6px 14px",
                  fontSize: "12px", color: "var(--text2)", cursor: "pointer"
                }}
              >
                {loading ? "Regenerating..." : "↻ Regenerate"}
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent", border: "none",
                fontSize: "20px", color: "var(--text3)", cursor: "pointer"
              }}
            >×</button>
          </div>
        </div>

        {/* Summary content */}
        {loading ? (
          <div style={{
            padding: "48px 0", textAlign: "center",
            color: "var(--text3)", fontSize: "14px"
          }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>🔍</div>
            Analysing case data...
          </div>
        ) : (
          <div style={{
            fontSize: "14px", lineHeight: 1.8,
            color: "var(--text)", whiteSpace: "pre-wrap"
          }}>
            {summary.split("\n").map((line, i) => {
              // Section headers — lines starting with a number and dot
              const isHeader = /^\d+\./.test(line.trim());
              if (isHeader) {
                return (
                  <div key={i} style={{
                    fontSize: "11px", fontWeight: 600,
                    color: "var(--text3)", textTransform: "uppercase",
                    letterSpacing: "0.8px", marginTop: "20px",
                    marginBottom: "6px"
                  }}>
                    {line.trim().replace(/^\d+\.\s*/, "")}
                  </div>
                );
              }
              if (line.trim() === "") return <div key={i} style={{ height: "4px" }} />;
              return (
                <div key={i} style={{ marginBottom: "4px" }}>
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}