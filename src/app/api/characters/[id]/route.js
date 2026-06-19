import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// PUT /api/characters/[id]
// Updates a character — verifies user owns the parent project
export async function PUT(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Fetch the character to find its parent project
    const charRes = await fetch(
      `${process.env.STRAPI_URL}/api/characters/${id}?populate[0]=project&populate[1]=project.owner`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!charRes.ok) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    const charData = await charRes.json();
    const character = charData.data;
    if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    if (token.role_type !== "admin") {
      const projectOwner = character.project?.owner?.id;
      if (!projectOwner || projectOwner != token.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, summary, description, expertise, association, category } = body;

    const res = await fetch(`${process.env.STRAPI_URL}/api/characters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: { name, summary, description, expertise, association, category },
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err) {
    console.error("PUT /api/characters/[id] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}