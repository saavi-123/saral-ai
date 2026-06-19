import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET /api/context-items?projectId=<documentId>
// Returns context items for a project — verifies user owns the project
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    // Verify project ownership first
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

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/context-items?filters[project][documentId][$eq]=${projectId}&sort=createdAt:desc&pagination[pageSize]=100`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/context-items ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/context-items
// Creates a context item — verifies user owns the parent project
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, content, item_type, project: projectId } = body;

    if (!title || !content || !projectId) {
      return NextResponse.json({ error: "title, content, and project are required" }, { status: 400 });
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

    const res = await fetch(`${process.env.STRAPI_URL}/api/context-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: { title, description, content, item_type, project: projectId },
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : 400 });
  } catch (err) {
    console.error("POST /api/context-items ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}