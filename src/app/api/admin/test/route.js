import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role_type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const res = await fetch(`${process.env.STRAPI_URL}/api/users?populate=role`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
  });

  const data = await res.json();
  return NextResponse.json({ strapiStatus: res.status, data });
}