"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";

export default function ProjectFilter({ projects }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.project_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status1 === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Search + Filter Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          style={{ flex: 1 }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "active", "pending", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "8px 14px", borderRadius: "8px", fontSize: "12px",
                fontWeight: 500, cursor: "pointer", border: "0.5px solid",
                borderColor: statusFilter === s ? "var(--accent)" : "var(--border2)",
                background: statusFilter === s ? "var(--accent)" : "transparent",
                color: statusFilter === s ? "var(--accent-text)" : "var(--text2)",
                transition: "all 0.15s",
                textTransform: "capitalize"
              }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No projects found
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)" }}>
            Try a different search term or filter
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}