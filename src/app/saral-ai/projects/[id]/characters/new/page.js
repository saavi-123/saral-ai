"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCharacter({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [expertise, setExpertise] = useState("");
  const [association, setAssociation] = useState("");
  const [category, setCategory] = useState("production");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);

    const countRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/characters?pagination[pageSize]=1000`);
    const countData = await countRes.json();
    const count = countData.meta.pagination.total + 1;
    const character_id = `CHR-${String(count).padStart(3, "0")}`;

    await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { name, summary, description, expertise, association, category, project: id, character_id }
      })
    });
    router.push(`/saral-ai/projects/${id}`);
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <Link href={`/projects/${id}`} style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Project
      </Link>

      <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", margin: "16px 0 4px" }}>
        Add Character
      </h1>
      <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "32px" }}>
        Add a specialist to this investigation
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Category Selector */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Character Category
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { value: "production", label: "Investigation Team Member", desc: "Real expert being consulted — detective, lawyer, forensic specialist" },
              { value: "story", label: "Case Subject", desc: "Character inside the case — suspect, witness, victim" }
            ].map((cat) => (
              <div
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  border: category === cat.value ? "2px solid var(--accent)" : "0.5px solid var(--border2)",
                  borderRadius: "10px", padding: "14px",
                  cursor: "pointer", transition: "all 0.15s",
                  background: category === cat.value ? "var(--bg2)" : "transparent"
                }}
              >
                <div style={{ fontWeight: 500, fontSize: "13px", color: "var(--text)", marginBottom: "4px" }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text2)", lineHeight: 1.5 }}>
                  {cat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={category === "production" ? "e.g. Detective Arjun Sharma" : "e.g. Rajan Mehta (Suspect)"}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Summary
          </label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One line summary of this character"
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Description
          </label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={category === "production" ? "Background, experience, specializations..." : "Character background, known facts, role in the case..."}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            {category === "production" ? "Expertise" : "Role in Case"}
          </label>
          <input
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder={category === "production" ? "e.g. Forensic Analysis, Criminal Law" : "e.g. Primary Suspect, Key Witness"}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            {category === "production" ? "Association" : "Known Connections"}
          </label>
          <input
            value={association}
            onChange={(e) => setAssociation(e.target.value)}
            placeholder={category === "production" ? "e.g. Mumbai Crime Branch" : "e.g. Former employee of TechCorp"}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            onClick={handleSubmit}
            disabled={!name || loading}
            style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500,
              opacity: !name || loading ? 0.5 : 1
            }}
          >
            {loading ? "Adding..." : "Add Character"}
          </button>
          <Link href={`/projects/${id}`}>
            <button style={{
              background: "transparent", border: "0.5px solid var(--border2)",
              borderRadius: "8px", padding: "10px 24px",
              fontSize: "14px", color: "var(--text2)"
            }}>
              Cancel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}