"use client";

import Link from "next/link";
import DeleteButton from "./DeleteButton";

export default function ProjectCard({ project }) {
  return (
    <div style={{
      border: "0.5px solid var(--border)",
      borderLeft: project.status1 === "active" ? "3px solid #1D9E75" : project.status1 === "pending" ? "3px solid #BA7517" : "3px solid var(--border2)",
      borderRadius: "12px", padding: "16px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg)"
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
            {project.name}
          </div>
          {project.project_id && (
            <span style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
              background: "var(--bg3)", color: "var(--text3)",
              fontWeight: 500, letterSpacing: "0.5px"
            }}>
              {project.project_id}
            </span>
          )}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text2)" }}>
          {project.description}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 500,
          background: project.status1 === "active" ? "#E1F5EE" : project.status1 === "pending" ? "#FAEEDA" : "var(--bg3)",
          color: project.status1 === "active" ? "#0F6E56" : project.status1 === "pending" ? "#854F0B" : "var(--text2)"
        }}>
          {project.status1}
        </span>
        <Link href={`/projects/${project.documentId}`}>
          <button style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "8px", padding: "7px 14px",
            fontSize: "12px", color: "var(--text2)"
          }}>View →</button>
        </Link>
        <DeleteButton
          endpoint={`/api/projects/${project.documentId}`}
          redirectTo="/"
          label="Delete"
        />
      </div>
    </div>
  );
}