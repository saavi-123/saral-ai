"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditCharacterForm({ character }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(character.name || "");
  const [summary, setSummary] = useState(character.summary || "");
  const [description, setDescription] = useState(character.description || "");
  const [expertise, setExpertise] = useState(character.expertise || "");
  const [association, setAssociation] = useState(character.association || "");
  const [category, setCategory] = useState(character.category || "production");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    await fetch(`/api/characters/${character.documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, summary, description, expertise, association, category }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: 500, color: "var(--text3)",
    textTransform: "uppercase", letterSpacing: "0.8px",
    display: "block", marginBottom: "8px"
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        background: "transparent", border: "0.5px solid var(--border2)",
        borderRadius: "8px", padding: "7px 14px",
        fontSize: "12px", color: "var(--text2)", cursor: "pointer"
      }}
    >
      Edit
    </button>
  );

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
        width: "min(560px, 90vw)", zIndex: 101,
        maxHeight: "85vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.4px" }}>
              Edit Character
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
              {character.character_id}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "transparent", border: "none",
              fontSize: "20px", color: "var(--text3)", cursor: "pointer"
            }}
          >×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Category */}
          <div>
            <label style={labelStyle}>Character Category</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { value: "production", label: "Investigation Team Member", desc: "Real expert being consulted" },
                { value: "story", label: "Case Subject", desc: "Character inside the case" }
              ].map((cat) => (
                <div
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    border: category === cat.value ? "2px solid var(--accent)" : "0.5px solid var(--border2)",
                    borderRadius: "10px", padding: "12px",
                    cursor: "pointer", transition: "all 0.15s",
                    background: category === cat.value ? "var(--bg2)" : "transparent"
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "13px", color: "var(--text)", marginBottom: "3px" }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text2)" }}>{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" />
          </div>

          {/* Summary */}
          <div>
            <label style={labelStyle}>Summary</label>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One line summary" />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Background, experience, role in the case..."
            />
          </div>

          {/* Expertise */}
          <div>
            <label style={labelStyle}>{category === "production" ? "Expertise" : "Role in Case"}</label>
            <input
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder={category === "production" ? "e.g. Forensic Analysis" : "e.g. Primary Suspect"}
            />
          </div>

          {/* Association */}
          <div>
            <label style={labelStyle}>{category === "production" ? "Association" : "Known Connections"}</label>
            <input
              value={association}
              onChange={(e) => setAssociation(e.target.value)}
              placeholder={category === "production" ? "e.g. Mumbai Crime Branch" : "e.g. Former employee of TechCorp"}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              onClick={handleSave}
              disabled={!name || loading}
              style={{
                background: "var(--accent)", color: "var(--accent-text)",
                border: "none", padding: "10px 24px", borderRadius: "8px",
                fontSize: "14px", fontWeight: 500, cursor: "pointer",
                opacity: !name || loading ? 0.5 : 1
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent", border: "0.5px solid var(--border2)",
                borderRadius: "8px", padding: "10px 24px",
                fontSize: "14px", color: "var(--text2)", cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}