import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// DELETE /api/context-items/[id]
export async function DELETE(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Fetch the context item to find its parent project
    const itemRes = await fetch(
      `${process.env.STRAPI_URL}/api/context-items/${id}?populate[0]=project&populate[1]=project.owner`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!itemRes.ok) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const itemData = await itemRes.json();
    const item = itemData.data;
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Admins can delete anything
    if (token.role_type !== "admin") {
      const projectOwner = item.project?.owner?.id;
      if (!projectOwner || projectOwner != token.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const res = await fetch(`${process.env.STRAPI_URL}/api/context-items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/context-items/[id] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}