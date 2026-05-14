"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("saral-theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("saral-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const isActive = (path) => pathname === path;
  const isSaralAI = pathname.startsWith("/saral-ai");

  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "var(--bg2)",
      borderRight: "0.5px solid var(--border)",
      padding: "24px 0",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <div style={{
        fontFamily: "var(--font-syne)",
        fontSize: "20px",
        fontWeight: 700,
        padding: "0 20px 20px",
        letterSpacing: "-0.5px",
        borderBottom: "0.5px solid var(--border)",
        marginBottom: "20px",
        color: "var(--text)"
      }}>
        Saral <span style={{ color: "var(--text2)", fontWeight: 400 }}>AI</span>
      </div>

      <NavLabel>Workspace</NavLabel>
      <NavItem href="/saral-ai/projects" active={isActive("/saral-ai/projects")}>
        <GridIcon /> All Projects
      </NavItem>
      <NavItem href="/saral-ai/projects" active={false}>
        <ClockIcon /> Active
      </NavItem>

      <Divider />
      <NavLabel>Tools</NavLabel>
      <NavItem href="/saral-ai/projects/new" active={isActive("/saral-ai/projects/new")}>
        <PlusIcon /> New Project
      </NavItem>

      <Divider />
      <NavItem href="/" active={isActive("/")}>
        <HomeIcon /> Dashboard
      </NavItem>

      <div style={{ flex: 1 }} />
      <Divider />
      <NavLabel>Preferences</NavLabel>

      <div
        onClick={toggleTheme}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "9px 20px",
          fontSize: "13px",
          color: "var(--text2)",
          cursor: "pointer",
          borderLeft: "2px solid transparent"
        }}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </div>

      <NavLabel style={{ marginTop: "8px" }}>Account</NavLabel>
      <NavItem href="/" active={false}>
        <UserIcon /> Saavi
      </NavItem>
    </aside>
  );
}

function NavLabel({ children }) {
  return (
    <div style={{
      fontSize: "10px", fontWeight: 500, color: "var(--text3)",
      letterSpacing: "1px", padding: "0 20px 8px", textTransform: "uppercase"
    }}>
      {children}
    </div>
  );
}

function NavItem({ href, active, children }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 20px", fontSize: "13px",
        color: active ? "var(--text)" : "var(--text2)",
        borderLeft: active ? "2px solid var(--text)" : "2px solid transparent",
        background: active ? "var(--active-bg)" : "transparent",
        fontWeight: active ? 500 : 400,
        transition: "all 0.15s"
      }}>
        {children}
      </div>
    </Link>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "0.5px solid var(--border)", margin: "12px 0" }} />;
}

function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>;
}
function ClockIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>;
}
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>;
}
function MoonIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10A6 6 0 016 3a6 6 0 100 10 6 6 0 007-3z"/></svg>;
}
function SunIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5L5 11M11 5l1.5-1.5"/></svg>;
}
function HomeIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6l6-4 6 4v8H2V6z"/><rect x="6" y="10" width="4" height="4"/></svg>;
}