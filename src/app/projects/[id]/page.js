import Link from "next/link";
import StatusUpdater from "../../components/StatusUpdater";
import DeleteButton from "../../components/DeleteButton";
import EditProjectForm from "../../components/EditProjectForm";
import EditCharacterForm from "../../components/EditCharacterForm";
import CharacterCard from "../../components/CharacterCard";
import CaseSummary from "../../components/CaseSummary";

async function getProject(documentId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects/${documentId}?populate=characters`, {
    cache: "no-store"
  });
  const data = await res.json();
  return data.data;
}

async function getContextItems(documentId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/context-items?filters[project][documentId][$eq]=${documentId}&pagination[pageSize]=100`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.data || [];
}

export default async function ProjectPage({ params }) {
  const { id } = await params;
  const [project, contextItems] = await Promise.all([
    getProject(id),
    getContextItems(id)
  ]);

  const productionChars = project.characters?.filter(c => c.category === "production" || !c.category) || [];
  const storyChars = project.characters?.filter(c => c.category === "story") || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Link href="/" style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>← Back to Projects</Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
                {project.name}
              </h1>
              {project.project_id && (
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                  background: "var(--bg3)", color: "var(--text3)",
                  fontWeight: 500, letterSpacing: "0.5px"
                }}>
                  {project.project_id}
                </span>
              )}
            </div>
            <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>{project.description}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <StatusUpdater documentId={id} currentStatus={project.status1} />
            <EditProjectForm project={project} />
            <DeleteButton
              endpoint={`/api/projects/${project.documentId}`}
              redirectTo="/"
              label="🗑 Delete"
            />
            <Link href={`/projects/${id}/queries`}>
              <button style={{
                background: "transparent", border: "0.5px solid var(--border2)",
                borderRadius: "8px", padding: "9px 18px",
                fontSize: "13px", color: "var(--text2)"
              }}>📋 History</button>
            </Link>
            <Link href={`/projects/${id}/context`}>
              <button style={{
                background: "transparent", border: "0.5px solid var(--border2)",
                borderRadius: "8px", padding: "9px 18px",
                fontSize: "13px", color: "var(--text2)"
              }}>📁 Context</button>
            </Link>
            <Link href={`/projects/${id}/chat`}>
              <button style={{
                background: "var(--accent)", color: "var(--accent-text)",
                border: "none", padding: "9px 18px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500
              }}>💬 Chat</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Total Characters", value: project.characters?.length || 0, color: "var(--text)" },
          { label: "Production", value: productionChars.length, color: "#185FA5" },
          { label: "Story", value: storyChars.length, color: "#534AB7" },
          { label: "Status", value: project.status1, color: project.status1 === "active" ? "#1D9E75" : project.status1 === "pending" ? "#BA7517" : "var(--text2)" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "var(--bg2)", borderRadius: "10px",
            padding: "16px", border: "0.5px solid var(--border)"
          }}>
            <div style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Case Summary Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "28px" }}>
        <CaseSummary
          project={project}
          characters={project.characters || []}
          contextItems={contextItems}
          projectId={id}
        />
      </div>

      {/* Add Character Button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          Characters
        </div>
        <Link href={`/projects/${project.documentId}/characters/new`}>
          <button style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "8px", padding: "7px 14px",
            fontSize: "12px", color: "var(--text2)"
          }}>+ Add Character</button>
        </Link>
      </div>

      {/* Production Characters */}
      {productionChars.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            fontSize: "11px", fontWeight: 500, color: "#185FA5",
            textTransform: "uppercase", letterSpacing: "0.8px",
            marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px"
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#185FA5" }} />
            Production Characters
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {productionChars.map((char) => (
              <CharacterCard key={char.id} char={char} color="#185FA5" bg="#E6F1FB" />
            ))}
          </div>
        </div>
      )}

      {/* Story Characters */}
      {storyChars.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            fontSize: "11px", fontWeight: 500, color: "#534AB7",
            textTransform: "uppercase", letterSpacing: "0.8px",
            marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px"
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#534AB7" }} />
            Story Characters
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {storyChars.map((char) => (
              <CharacterCard key={char.id} char={char} color="#534AB7" bg="#EEEDFE" />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {project.characters?.length === 0 && (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>👤</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No characters yet
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>
            Add your first character to start the investigation
          </div>
          <Link href={`/projects/${project.documentId}/characters/new`}>
            <button style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500
            }}>
              Add First Character
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}