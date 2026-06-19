import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET /api/queries?projectId=<documentId>
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
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
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (token.role_type !== "admin" && project.owner?.id != token.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/queries?filters[project][documentId][$eq]=${projectId}&populate=character&sort=createdAt:desc&pagination[pageSize]=1000`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/queries ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}