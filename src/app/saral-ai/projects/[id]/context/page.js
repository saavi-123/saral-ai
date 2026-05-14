import Link from "next/link";
import AddContextForm from "../../../../components/AddContextForm";
import DeleteButton from "../../../../components/DeleteButton";

async function getContextItems(documentId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/context-items?filters[project][documentId][$eq]=${documentId}&sort=createdAt:desc`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.data;
}

async function getProject(documentId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects/${documentId}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.data;
}

const typeColors = {
  evidence: { bg: "#E1F5EE", color: "#0F6E56" },
  statement: { bg: "#E6F1FB", color: "#185FA5" },
  financial: { bg: "#FAEEDA", color: "#854F0B" },
  timeline: { bg: "#EEEDFE", color: "#534AB7" },
  notes: { bg: "var(--bg3)", color: "var(--text2)" }
};

export default async function ContextPage({ params }) {
  const { id } = await params;
  const [items, project] = await Promise.all([
    getContextItems(id),
    getProject(id)
  ]);

  return (
    <div>
      <Link href={`/saral-ai/projects/${id}`} style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Project
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "16px 0 32px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Case Context
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
            {project?.name} · {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "28px" }}>
        {["evidence", "statement", "financial", "timeline", "notes"].map((type) => {
          const count = items.filter(i => i.item_type === type).length;
          const { bg, color } = typeColors[type];
          return (
            <div key={type} style={{
              background: "var(--bg2)", borderRadius: "10px",
              padding: "12px", border: "0.5px solid var(--border)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                {type}
              </div>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 700, color: count > 0 ? color : "var(--text3)" }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Context Form */}
      <AddContextForm projectId={id} />

      {/* Context Items List */}
      {items.length === 0 ? (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center", marginTop: "20px"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📁</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No context items yet
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)" }}>
            Add evidence, statements, financial records or notes above
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
          {items.map((item) => {
            const { bg, color } = typeColors[item.item_type] || typeColors.notes;
            return (
              <div key={item.id} style={{
                border: "0.5px solid var(--border)",
                borderRadius: "12px", padding: "16px 20px",
                background: "var(--bg)"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                      background: bg, color: color, fontWeight: 500
                    }}>
                      {item.item_type}
                    </span>
                    <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>
                      {item.title}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                    <DeleteButton
                      endpoint={`/api/context-items/${item.documentId}`}
                      label="Delete"
                    />
                  </div>
                </div>
                {item.description && (
                  <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "8px" }}>
                    {item.description}
                  </div>
                )}
                {item.content && (
                  <div style={{
                    fontSize: "13px", color: "var(--text)", lineHeight: 1.7,
                    background: "var(--bg2)", borderRadius: "8px",
                    padding: "12px", marginTop: "8px",
                    whiteSpace: "pre-wrap"
                  }}>
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}