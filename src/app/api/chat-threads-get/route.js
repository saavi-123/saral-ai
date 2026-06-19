import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET /api/chat-threads-get?threadId=<documentId>
// Verifies the requesting user owns the project this thread belongs to
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/chat-threads/${threadId}?populate[0]=project&populate[1]=project.owner`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!res.ok) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const data = await res.json();
    const thread = data.data;
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    // Ownership check — admins can access any thread
    if (token.role_type !== "admin") {
      const projectOwner = thread.project?.owner?.id;
      if (!projectOwner || projectOwner != token.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/chat-threads-get ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}