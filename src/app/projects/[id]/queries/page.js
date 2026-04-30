import Link from "next/link";

async function getQueries(documentId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/queries?filters[project][documentId][$eq]=${documentId}&populate=character&sort=createdAt:desc`,
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

export default async function QueriesPage({ params }) {
  const { id } = await params;
  const [queries, project] = await Promise.all([
    getQueries(id),
    getProject(id)
  ]);

  return (
    <div>
      <Link href={`/projects/${id}`} style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Project
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "16px 0 32px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Investigation History
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
            {project?.name} · {queries.length} {queries.length === 1 ? "query" : "queries"}
          </p>
        </div>
        <Link href={`/projects/${id}/ask`}>
          <button style={{
            background: "var(--accent)", color: "var(--accent-text)",
            border: "none", padding: "9px 18px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 500
          }}>
            + New Query
          </button>
        </Link>
      </div>

      {queries.length === 0 ? (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No queries yet
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>
            Start asking your characters questions to build the investigation history
          </div>
          <Link href={`/projects/${id}/ask`}>
            <button style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500
            }}>
              Ask First Question
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {queries.map((query, index) => (
            <div key={query.id} style={{
              border: "0.5px solid var(--border)",
              borderRadius: "12px", overflow: "hidden",
              background: "var(--bg)"
            }}>
              {/* Query Header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "0.5px solid var(--border)",
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "var(--bg3)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "10px", fontWeight: 500,
                    color: "var(--text2)", flexShrink: 0
                  }}>
                    {query.character?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "13px", color: "var(--text)" }}>
                      {query.character?.name || "Unknown Character"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                      {query.character?.expertise || ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                    background: "var(--bg3)", color: "var(--text3)", fontWeight: 500
                  }}>
                    #{queries.length - index}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                    {new Date(query.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>

              {/* Question */}
              <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
                <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                  Question
                </div>
                <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.6 }}>
                  {query.question}
                </p>
              </div>

              {/* Info Requested */}
              {query.needed_info && (
                <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)", background: "var(--bg2)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                    Information Requested
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: 1.6 }}>
                    {query.needed_info}
                  </p>
                </div>
              )}

              {/* Info Provided */}
              {query.provided_info && (
                <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                    Information Provided
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: 1.6 }}>
                    {query.provided_info}
                  </p>
                </div>
              )}

              {/* Final Answer */}
              {query.final_answer && (
                <div style={{ padding: "16px 20px", borderLeft: "3px solid #1D9E75" }}>
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                    Analysis
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.8 }}>
                    {query.final_answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}