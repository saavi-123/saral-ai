"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProjectForm({ project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    // Calls our internal API route — ownership check happens server-side
    await fetch(`/api/projects/${project.documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "transparent",
          border: "0.5px solid var(--border2)",
          borderRadius: "8px",
          padding: "9px 18px",
          fontSize: "13px",
          color: "var(--text2)",
          cursor: "pointer",
        }}
      >
        ✏️ Edit
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg)",
          borderRadius: "12px",
          padding: "28px",
          width: "480px",
          border: "0.5px solid var(--border2)",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "20px",
          }}
        >
          Edit Project
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Project Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSave}
              disabled={!name || loading}
              style={{
                background: "var(--accent)",
                color: "var(--accent-text)",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                opacity: !name || loading ? 0.5 : 1,
                cursor: !name || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "0.5px solid var(--border2)",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "14px",
                color: "var(--text2)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}