import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Verifies the requesting user owns the project that the given thread belongs to
async function verifyThreadOwnership(threadId, token) {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/chat-threads/${threadId}?populate[0]=project&populate[1]=project.owner`,
    {
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
      cache: "no-store",
    }
  );

  if (!res.ok) return { error: "Thread not found", status: 404 };

  const data = await res.json();
  const thread = data.data;
  if (!thread) return { error: "Thread not found", status: 404 };

  if (token.role_type === "admin") return { thread };

  const projectOwner = thread.project?.owner?.id;
  if (!projectOwner || projectOwner != token.id) {
    return { error: "Forbidden", status: 403 };
  }

  return { thread };
}

// GET /api/messages?threadId=<documentId>
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const { error, status } = await verifyThreadOwnership(threadId, token);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/messages?filters[chat_thread][documentId][$eq]=${threadId}&populate=character&sort=createdAt:asc&pagination[pageSize]=1000`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/messages ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/messages
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { role, content, message_type, chat_thread, character } = body;

    if (!chat_thread) {
      return NextResponse.json({ error: "chat_thread is required" }, { status: 400 });
    }

    const { error, status } = await verifyThreadOwnership(chat_thread, token);
    if (error) return NextResponse.json({ error }, { status });

    const res = await fetch(`${process.env.STRAPI_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: { role, content, message_type, chat_thread, character: character || null },
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : 400 });
  } catch (err) {
    console.error("POST /api/messages ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}