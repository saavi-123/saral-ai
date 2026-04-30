"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusUpdater({ documentId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    setStatus(newStatus);

    await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { status1: newStatus } })
    });

    setUpdating(false);
    router.refresh();
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={updating}
      style={{
        background: status === "active" ? "#E1F5EE" : status === "pending" ? "#FAEEDA" : "var(--bg2)",
        color: status === "active" ? "#0F6E56" : status === "pending" ? "#854F0B" : "var(--text2)",
        border: "0.5px solid var(--border2)",
        borderRadius: "8px",
        padding: "8px 14px",
        fontSize: "13px",
        fontWeight: 500,
        width: "auto",
        cursor: "pointer"
      }}
    >
      <option value="active">Active</option>
      <option value="pending">Pending</option>
      <option value="closed">Closed</option>
    </select>
  );
}