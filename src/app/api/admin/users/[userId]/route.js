import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const VALID_ROLES = ["admin", "investigator", "corporate"];

const VALID_TOOLS = [
  "saral-ai", "geolocation", "email-security", "cdr", "imei-lookup",
  "ceir-tracer", "cell-spyder", "mni-analysis", "tsp-lookup", "mcc-mnc",
  "mac-lookup", "sms-header", "bsa", "phonepe-analyzer", "nccrp-graph",
  "tsdp", "atm-lookup", "ifsc-lookup", "lat-long-mapper", "sugam-route",
  "toll-plaza", "ipdr-analysis", "google-analyzer", "aadhaar-validator",
  "caf-summarizer", "ip-intelligence", "hash-generator", "ps-lookup",
  "nodal-officers", "lea-templates", "ic-connect", "tip-line",
];

function adminOnly(token) {
  if (!token || token.role_type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// PUT /api/admin/users/[userId]
export async function PUT(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const denied = adminOnly(token);
  if (denied) return denied;

  const { userId } = await params;
  const body = await request.json();


  // Safeguard: prevent removing your own admin role
  if (Number(userId) === Number(token.sub) && body.role_type && body.role_type !== "admin") {
    return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
  }

  // Validate role_type if provided
  if (body.role_type && !VALID_ROLES.includes(body.role_type)) {
    return NextResponse.json({ error: "Invalid role_type" }, { status: 400 });
  }

  // Sanitize allowed_tools if provided — strip anything not in the known list
  if (body.allowed_tools !== undefined) {
    body.allowed_tools = body.allowed_tools.filter(t => VALID_TOOLS.includes(t));
  }

  const res = await fetch(`${process.env.STRAPI_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : 400 });
}

// DELETE /api/admin/users/[userId]
export async function DELETE(request, { params }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const denied = adminOnly(token);
  if (denied) return denied;

  const { userId } = await params;

  // Safeguard: prevent deleting yourself
  if (Number(userId) === Number(token.sub)) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const res = await fetch(`${process.env.STRAPI_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
    },
  });

  return NextResponse.json({ success: res.ok }, { status: res.ok ? 200 : 400 });
}