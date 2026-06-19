import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Verify the requesting user owns the project this thread belongs to
async function verifyThreadAccess(threadDocumentId, token) {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/chat-threads/${threadDocumentId}?populate[0]=project&populate[1]=project.owner`,
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

// PUT /api/chat-threads/[id]
// Used for renaming a thread title
export async function PUT(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error, status } = await verifyThreadAccess(id, token);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();
    const { title } = body;

    const res = await fetch(`${process.env.STRAPI_URL}/api/chat-threads/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ data: { title } }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err) {
    console.error("PUT /api/chat-threads/[id] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/chat-threads/[id]
export async function DELETE(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error, status } = await verifyThreadAccess(id, token);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const res = await fetch(`${process.env.STRAPI_URL}/api/chat-threads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/chat-threads/[id] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}