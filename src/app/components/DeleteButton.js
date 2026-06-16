"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// DeleteButton now calls internal Next.js API routes (which check auth + ownership)
// instead of calling Strapi directly.
//
// Usage in project page:
//   <DeleteButton endpoint={`/api/projects/${project.documentId}`} redirectTo="/saral-ai/projects" label="🗑 Delete" />
//
// The endpoint must be a Next.js API route path, NOT a Strapi URL.
// The Next.js route handles the ownership check and then calls Strapi internally.

export default function DeleteButton({ endpoint, redirectTo, label = "Delete" }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      // Calls our internal API route — NO direct Strapi URL
      const res = await fetch(endpoint, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Delete failed (${res.status})`);
        setLoading(false);
        setConfirming(false);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }

    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      setConfirming(false);
    }
  };

  if (error) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#A32D2D" }}>{error}</span>
        <button
          onClick={() => setError("")}
          style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "6px", padding: "4px 8px",
            fontSize: "11px", color: "var(--text2)", cursor: "pointer"
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "var(--text2)" }}>Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            background: "#A32D2D", color: "#fff",
            border: "none", padding: "6px 12px", borderRadius: "6px",
            fontSize: "12px", fontWeight: 500, cursor: "pointer"
          }}
        >
          {loading ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "6px", padding: "6px 12px",
            fontSize: "12px", color: "var(--text2)", cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        background: "transparent", border: "0.5px solid #F09595",
        borderRadius: "6px", padding: "6px 12px",
        fontSize: "12px", color: "#A32D2D", cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}