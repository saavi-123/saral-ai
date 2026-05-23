"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export default function GeoSidebarFooter() {
  const { data: session } = useSession();

  return (
    <div style={{
      borderTop: "0.5px solid var(--border)",
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      <ThemeToggle />
      <Link href="/" style={{
        fontSize: "13px", color: "var(--text2)",
        textDecoration: "none"
      }}>
        ← Dashboard
      </Link>

      {/* Divider */}
      <div style={{ height: "0.5px", background: "var(--border)" }} />

      {/* Username */}
      <div style={{ fontSize: "12px", color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {session?.user?.name || session?.user?.email || ""}
      </div>

      {/* Sign out */}
      <div
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 12px",
          border: "0.5px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text3)",
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.15s",
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
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </div>
    </div>
  );
}