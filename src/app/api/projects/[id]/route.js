import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Helper: fetch the project and verify the requesting user owns it (or is admin)
async function getProjectAndVerifyOwner(documentId, token) {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/projects/${documentId}?populate=owner`,
    {
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
      cache: "no-store",
    }
  );

  if (!res.ok) return { error: "Project not found", status: 404 };

  const data = await res.json();
  const project = data.data;

  if (!project) return { error: "Project not found", status: 404 };

  // Admins can access any project
  if (token.role_type === "admin") return { project };

  // Everyone else must be the owner
  const ownerId = project.owner?.id;
  if (!ownerId || ownerId !== token.id) {
    return { error: "Forbidden", status: 403 };
  }

  return { project };
}

// GET /api/projects/[id]
// Returns a single project (with characters populated) if the user owns it or is admin
export async function GET(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { project, error, status } = await getProjectAndVerifyOwner(id, token);
  if (error) return NextResponse.json({ error }, { status });

  // Re-fetch with characters populated (the ownership check fetch already confirmed access)
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/projects/${id}?populate=characters`,
    {
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}

// PUT /api/projects/[id]
// Updates a project (name, description, status1) — owner or admin only
export async function PUT(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error, status } = await getProjectAndVerifyOwner(id, token);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();

    const res = await fetch(`${process.env.STRAPI_URL}/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ data: body }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });

  } catch (err) {
    console.error("PUT /api/projects/[id] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
// Deletes a project and all related records — owner or admin only
export async function DELETE(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error, status } = await getProjectAndVerifyOwner(id, token);
  if (error) return NextResponse.json({ error }, { status });

  try {
    // Strapi's cascade-delete service override handles cleanup of
    // characters, chat threads, messages, context items, queries
    const res = await fetch(`${process.env.STRAPI_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("DELETE project Strapi error:", res.status, text);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE /api/projects/[id] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}