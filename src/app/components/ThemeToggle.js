"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("saral-theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("saral-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: "transparent",
        border: "0.5px solid var(--border2)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        color: "var(--text2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-dm)"
      }}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}