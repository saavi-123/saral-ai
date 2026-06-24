import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// GET /api/hash-certificates
// Admin → all certificates
// Everyone else → only their own
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let url;

    if (token.role_type === "admin") {
      url = `${process.env.STRAPI_URL}/api/hash-certificates?populate=owner&sort=generated_at:desc&pagination[pageSize]=1000`;
    } else {
      url = `${process.env.STRAPI_URL}/api/hash-certificates?filters[owner][id][$eq]=${token.id}&populate=owner&sort=generated_at:desc&pagination[pageSize]=1000`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/hash-certificates ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/hash-certificates
// Creates a new certificate log entry — owner auto-assigned, file bytes never sent here
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      case_number,
      police_station,
      investigating_officer,
      algorithms_used,
      file_count,
      total_size_bytes,
      evidence_summary,
    } = body;

    if (!algorithms_used || !file_count || !evidence_summary) {
      return NextResponse.json(
        { error: "algorithms_used, file_count, and evidence_summary are required" },
        { status: 400 }
      );
    }

    // Generate certificate ID: HASH-YYYYMMDD-XXXXX (random 5-digit suffix)
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const certificate_id = `HASH-${datePart}-${randomSuffix}`;

    const res = await fetch(`${process.env.STRAPI_URL}/api/hash-certificates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          certificate_id,
          case_number: case_number || null,
          police_station: police_station || null,
          investigating_officer: investigating_officer || null,
          algorithms_used,
          file_count,
          total_size_bytes: total_size_bytes || 0,
          evidence_summary,
          owner: token.id,
          generated_at: now.toISOString(),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Strapi error creating hash certificate:", data);
      return NextResponse.json({ error: "Failed to save certificate log" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/hash-certificates ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}