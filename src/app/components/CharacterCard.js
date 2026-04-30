"use client";

import DeleteButton from "./DeleteButton";
import EditCharacterForm from "./EditCharacterForm";

export default function CharacterCard({ char, color, bg }) {
  return (
    <div style={{
      border: "0.5px solid var(--border)",
      borderRadius: "12px", padding: "16px 20px",
      background: "var(--bg)", display: "flex",
      alignItems: "flex-start", gap: "14px"
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "50%",
        background: bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "13px", fontWeight: 500,
        color: color, flexShrink: 0
      }}>
        {char.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>{char.name}</div>
          <span style={{
            fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
            background: bg, color: color, fontWeight: 500
          }}>
            {char.category === "story" ? "Story" : "Production"}
          </span>
          {char.character_id && (
            <span style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
              background: "var(--bg3)", color: "var(--text3)",
              fontWeight: 500, letterSpacing: "0.5px"
            }}>
              {char.character_id}
            </span>
          )}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "4px" }}>
          {char.expertise} · {char.association}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text3)" }}>
          {char.summary}
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <EditCharacterForm character={char} />
        <DeleteButton
          endpoint={`/api/characters/${char.documentId}`}
          label="Delete"
        />
      </div>
    </div>
  );
}