"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditThreadTitle({ thread, fontSize = "14px", fontWeight = 500 }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [title, setTitle] = useState(thread.title || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads/${thread.documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { title } })
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  };

  if (editing) {
    return (
      <div
        style={{ display: "flex", gap: "8px", alignItems: "center" }}
        onClick={e => e.preventDefault()}
      >
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setEditing(false); setTitle(thread.title); }
          }}
          style={{ fontSize, fontWeight, width: "220px" }}
        />
        <button
          onClick={handleSave}
          disabled={!title.trim() || loading}
          style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "6px 14px", borderRadius: "6px",
            fontSize: "12px", fontWeight: 500, cursor: "pointer",
            opacity: !title.trim() || loading ? 0.5 : 1
          }}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => { setEditing(false); setTitle(thread.title); }}
          style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "6px", padding: "6px 14px",
            fontSize: "12px", color: "var(--text2)", cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={e => { e.preventDefault(); setEditing(true); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        cursor: "text",
        padding: "2px 6px", borderRadius: "6px",
        background: hovered ? "var(--bg3)" : "transparent",
        transition: "background 0.15s"
      }}
    >
      <span style={{ fontSize, fontWeight, color: "var(--text)" }}>
        {thread.title}
      </span>
      {hovered && (
        <span style={{ fontSize: "11px", color: "var(--text3)" }}>✏️</span>
      )}
    </div>
  );
}