import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET /api/projects
// Admin → all projects
// Everyone else → only projects where owner = session.user.id
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("TOKEN ID:", token.id);
    console.log("ROLE:", token.role_type);
    let url;

    if (token.role_type === "admin") {
      // Admins see everything
      url = `${process.env.STRAPI_URL}/api/projects?populate=owner&pagination[pageSize]=1000`;
    } else {
      // Everyone else sees only their own projects
      url = `${process.env.STRAPI_URL}/api/projects?filters[owner][id][$eq]=${token.id}&populate=owner&pagination[pageSize]=1000`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });
    const data = await res.json();
    console.log("STRAPI URL:", url);
    console.log("PROJECTS RESPONSE:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);

  } catch (err) {
    console.error("GET /api/projects ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/projects
// Creates a new project and automatically sets owner = logged-in user
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, status1, project_id } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const res = await fetch(`${process.env.STRAPI_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name,
          description,
          status1,
          project_id,
          owner: token.id, // numeric user id from NextAuth JWT
        },
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : 400 });

  } catch (err) {
    console.error("POST /api/projects ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}