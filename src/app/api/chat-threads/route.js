import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// POST /api/chat-threads
// Creates a new thread — verifies user owns the parent project
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, project: projectId } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "title and project are required" }, { status: 400 });
    }

    // Verify project ownership
    const projectRes = await fetch(
      `${process.env.STRAPI_URL}/api/projects/${projectId}?populate=owner`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!projectRes.ok) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectData = await projectRes.json();
    const project = projectData.data;

    if (token.role_type !== "admin" && project.owner?.id != token.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const res = await fetch(`${process.env.STRAPI_URL}/api/chat-threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: { title, project: projectId },
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : 400 });
  } catch (err) {
    console.error("POST /api/chat-threads ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}