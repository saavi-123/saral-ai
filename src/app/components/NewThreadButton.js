"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewThreadButton({ projectId }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { title, project: projectId }
        })
    });
    const data = await res.json();
    console.log("Created thread:", data);
    setLoading(false);
    setShowForm(false);
    setTitle("");
  
    const threadId = data.data?.documentId || data.data?.id;
    router.push(`/projects/${projectId}/chat/${threadId}`);
  };

  if (showForm) {
    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Thread title..."
          style={{ width: "220px" }}
        />
        <button
          onClick={handleCreate}
          disabled={!title || loading}
          style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "9px 18px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500,
            opacity: !title || loading ? 0.5 : 1
          }}
        >
          {loading ? "Creating..." : "Create"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "8px", padding: "9px 18px",
            fontSize: "13px", color: "var(--text2)"
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      style={{
        background: "var(--accent)", color: "var(--accent-text)",
        border: "none", padding: "9px 18px", borderRadius: "8px",
        fontSize: "13px", fontWeight: 500
      }}
    >
      + New Thread
    </button>
  );
}