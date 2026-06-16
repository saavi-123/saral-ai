import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProjectFilter from "../../components/ProjectFilter";

async function getProjects(session) {
  const token = session?.user;
  if (!token) return [];

  let url;
  if (token.role_type === "admin") {
    url = `${process.env.STRAPI_URL}/api/projects?populate=owner&pagination[pageSize]=1000`;
  } else {
    url = `${process.env.STRAPI_URL}/api/projects?filters[owner][id][$eq]=${token.id}&populate=owner&pagination[pageSize]=1000`;
  }
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const projects = await getProjects(session);

  const active = projects.filter((p) => p.status1 === "active").length;
  const pending = projects.filter((p) => p.status1 === "pending").length;
  const closed = projects.filter((p) => p.status1 === "closed").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>Projects</h1>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>{projects.length} projects · {active} active</p>
        </div>
        <Link href="/saral-ai/projects/new">
          <button style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "9px 18px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500
          }}>+ New Project</button>
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Total Projects", value: projects.length, color: "var(--text)" },
          { label: "Active", value: active, color: "#1D9E75" },
          { label: "Pending", value: pending, color: "#BA7517" },
          { label: "Closed", value: closed, color: "var(--text3)" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "var(--bg2)", borderRadius: "10px",
            padding: "16px", border: "0.5px solid var(--border)"
          }}>
            <div style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <ProjectFilter projects={projects} />
    </div>
  );
}