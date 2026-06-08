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

// GET /api/admin/users
export async function GET(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const denied = adminOnly(token);
  if (denied) return denied;

  const res = await fetch(`${process.env.STRAPI_URL}/api/users?populate=role`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}

// POST /api/admin/users
export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const denied = adminOnly(token);
  if (denied) return denied;

  const body = await request.json();
  const { username, email, password, role_type, allowed_tools } = body;

  if (!username || !email || !password || !role_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role_type)) {
    return NextResponse.json({ error: "Invalid role_type" }, { status: 400 });
  }

  try {
    const rolesRes = await fetch(`${process.env.STRAPI_URL}/api/users-permissions/roles`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}` },
    });
    const rolesData = await rolesRes.json();

    const authenticatedRole = rolesData.roles?.find(r => r.type === "authenticated");

    if (!authenticatedRole) {
      return NextResponse.json({ error: "Could not find Authenticated role" }, { status: 500 });
    }

    const sanitizedTools = (allowed_tools || []).filter(t => VALID_TOOLS.includes(t));

    const res = await fetch(`${process.env.STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        username,
        email,
        password,
        role_type,
        allowed_tools: sanitizedTools,
        confirmed: true,
        blocked: false,
        role: authenticatedRole.id,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : 400 });

  } catch (err) {
    console.error("POST /api/admin/users ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}