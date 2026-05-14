"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status1, setStatus1] = useState("active");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);

    const countRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects?pagination[pageSize]=1000`);
    const countData = await countRes.json();
    const count = countData.meta.pagination.total + 1;
    const project_id = `PRJ-${String(count).padStart(3, "0")}`;

    await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { name, description, status1, project_id }
      })
    });

    router.push("/");
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <Link href="/" style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Projects
      </Link>

      <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)", margin: "16px 0 4px" }}>
        New Project
      </h1>
      <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "32px" }}>
        Create a new investigation
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Project Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sharma Murder Case"
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Description
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this investigation..."
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
            Status
          </label>
          <select value={status1} onChange={(e) => setStatus1(e.target.value)}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
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
            {loading ? "Creating..." : "Create Project"}
          </button>
          <Link href="/">
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