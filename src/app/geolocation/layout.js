import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "Geolocation Tracking",
};

export default function GeolocationLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: "220px",
        background: "var(--bg2)",
        borderRight: "0.5px solid var(--border)",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0
      }}>
        <div style={{
          fontFamily: "var(--font-syne)",
          fontSize: "16px", fontWeight: 700,
          padding: "0 20px 20px",
          letterSpacing: "-0.5px",
          borderBottom: "0.5px solid var(--border)",
          marginBottom: "20px",
          color: "var(--text)"
        }}>
          🎯 Geolocation Tracking
        </div>

        <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link href="/geolocation" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "9px 12px", borderRadius: "8px",
              fontSize: "13px", color: "var(--text2)",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              📋 Sessions
            </div>
          </Link>
          <Link href="/geolocation/new" style={{ textDecoration: "none" }}>
            <div style={{
              padding: "9px 12px", borderRadius: "8px",
              fontSize: "13px", color: "var(--text2)",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              ➕ New Session
            </div>
          </Link>
        </div>

        <div style={{ flex: 1 }} />

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
        </div>
      </aside>

      <main style={{
        marginLeft: "220px", flex: 1,
        minHeight: "100vh", background: "var(--bg)"
      }}>
        {children}
      </main>
    </div>
  );
}