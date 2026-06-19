import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET /api/characters?projectId=<documentId>
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
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (token.role_type !== "admin" && project.owner?.id != token.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/characters?filters[project][documentId][$eq]=${projectId}&pagination[pageSize]=100`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/characters ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// POST /api/characters
// Creates a new character — verifies user owns the parent project
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, summary, description, expertise, association, category, project: projectId, character_id } = body;

    if (!name || !projectId) {
      return NextResponse.json({ error: "name and project are required" }, { status: 400 });
    }

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

    const res = await fetch(`${process.env.STRAPI_URL}/api/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: { name, summary, description, expertise, association, category, project: projectId, character_id },
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : 400 });
  } catch (err) {
    console.error("POST /api/characters ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}