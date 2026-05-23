"use client";

import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "13px", color: "var(--text3)" }}>
        {session.user.name || session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 12px",
          background: "transparent",
          border: "0.5px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text3)",
          fontSize: "13px",
          cursor: "pointer",
          fontFamily: "var(--font-dm)",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(163,45,45,0.1)";
          e.currentTarget.style.color = "#e57373";
          e.currentTarget.style.borderColor = "rgba(163,45,45,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text3)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  );
}