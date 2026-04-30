"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint, redirectTo, label = "Delete" }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`;
    console.log("Deleting:", url);
    const res = await fetch(url, { method: "DELETE" });
    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response body:", text);
    setLoading(false);
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
    } else {
      router.refresh();
    }
  };

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