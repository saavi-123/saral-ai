"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddContextForm({ projectId }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("evidence");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) return;
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/context-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          title,
          description,
          content,
          item_type: contentType,
          project: projectId
        }
      })
    });
    setTitle("");
    setDescription("");
    setContent("");
    setContentType("evidence");
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const typeColors = {
    evidence: { bg: "#E1F5EE", color: "#0F6E56" },
    statement: { bg: "#E6F1FB", color: "#185FA5" },
    financial: { bg: "#FAEEDA", color: "#854F0B" },
    timeline: { bg: "#EEEDFE", color: "#534AB7" },
    notes: { bg: "var(--bg3)", color: "var(--text2)" }
  };

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "10px 24px", borderRadius: "8px",
            fontSize: "14px", fontWeight: 500, width: "100%"
          }}
        >
          + Add Context Item
        </button>
      ) : (
        <div style={{
          border: "0.5px solid var(--border2)",
          borderRadius: "12px", padding: "20px",
          background: "var(--bg2)", marginBottom: "8px"
        }}>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", marginBottom: "16px" }}>
            Add New Context Item
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Type Selector */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
                Type
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["evidence", "statement", "financial", "timeline", "notes"].map((type) => {
                  const { bg, color } = typeColors[type];
                  return (
                    <div
                      key={type}
                      onClick={() => setContentType(type)}
                      style={{
                        padding: "5px 14px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: 500,
                        cursor: "pointer", transition: "all 0.15s",
                        background: contentType === type ? bg : "var(--bg3)",
                        color: contentType === type ? color : "var(--text3)",
                        border: contentType === type ? `1px solid ${color}` : "1px solid transparent"
                      }}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bank Statement March 2026"
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
                Brief Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One line summary of this item"
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
                Content
              </label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the full text content, evidence details, statement transcript, financial data, or notes here..."
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSubmit}
                disabled={!title || !content || loading}
                style={{
                  background: "var(--accent)", color: "var(--accent-text)",
                  border: "none", padding: "10px 24px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 500,
                  opacity: !title || !content || loading ? 0.5 : 1
                }}
              >
                {loading ? "Saving..." : "Save Item"}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent", border: "0.5px solid var(--border2)",
                  borderRadius: "8px", padding: "10px 24px",
                  fontSize: "14px", color: "var(--text2)"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}