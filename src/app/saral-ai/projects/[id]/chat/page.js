import Link from "next/link";
import NewThreadButton from "../../../../components/NewThreadButton";
import DeleteButton from "../../../../components/DeleteButton";
import EditThreadTitle from "../../../../components/EditThreadTitle";

async function getThreads(documentId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads?filters[project][documentId][$eq]=${documentId}&sort=createdAt:desc`,
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

export default async function ChatPage({ params }) {
  const { id } = await params;
  const [threads, project] = await Promise.all([
    getThreads(id),
    getProject(id)
  ]);

  // Build tree structure from flat list
  const threadMap = {};
  threads.forEach(t => threadMap[t.documentId] = { ...t, children: [] });

  const rootThreads = [];
  threads.forEach(t => {
    if (t.branched_from && threadMap[t.branched_from]) {
      threadMap[t.branched_from].children.push(threadMap[t.documentId]);
    } else if (!t.branched_from) {
      rootThreads.push(threadMap[t.documentId]);
    } else {
      // parent was deleted, treat as root
      rootThreads.push(threadMap[t.documentId]);
    }
  });

  return (
    <div>
      <Link href={`/saral-ai/projects/${id}`} style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Project
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "16px 0 32px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Conversations
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
            {project?.name} · {threads.length} {threads.length === 1 ? "thread" : "threads"}
          </p>
        </div>
        <NewThreadButton projectId={id} />
      </div>

      {threads.length === 0 ? (
        <div style={{
          border: "0.5px solid var(--border)", borderRadius: "12px",
          padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>💬</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No conversations yet
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>
            Start a new conversation with your investigation team
          </div>
          <NewThreadButton projectId={id} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rootThreads.map(thread => (
            <ThreadTree key={thread.id} thread={thread} id={id} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadTree({ thread, id, depth }) {
  return (
    <div>
      <div style={{ marginLeft: `${depth * 24}px` }}>
        <ThreadCard thread={thread} id={id} isBranch={depth > 0} />
      </div>
      {thread.children?.map(child => (
        <ThreadTree key={child.id} thread={child} id={id} depth={depth + 1} />
      ))}
    </div>
  );
}

function ThreadCard({ thread, id, isBranch }) {
  return (
    <div style={{ position: "relative" }}>
      <Link
        href={`/saral-ai/projects/${id}/chat/${thread.documentId}`}
        style={{ textDecoration: "none" }}
      >
        <div style={{
          border: "0.5px solid var(--border)",
          borderLeft: isBranch ? "3px solid #534AB7" : "0.5px solid var(--border)",
          borderRadius: "12px", padding: "16px 20px",
          background: "var(--bg)", cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          transition: "border-color 0.15s"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: isBranch ? "#EEEDFE" : "var(--bg3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px"
            }}>
              {isBranch ? "⑂" : "💬"}
            </div>
            <div>
              <EditThreadTitle thread={thread} fontSize="14px" fontWeight={500} />
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                {new Date(thread.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
                {isBranch && <span style={{ color: "#534AB7", marginLeft: "6px" }}>· branched</span>}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text3)" }}>→</div>
        </div>
      </Link>
      <div style={{
        position: "absolute", right: "52px", top: "50%",
        transform: "translateY(-50%)"
      }}>
        <DeleteButton
          endpoint={`/api/chat-threads/${thread.documentId}`}
          label="Delete"
        />
      </div>
    </div>
  );
}