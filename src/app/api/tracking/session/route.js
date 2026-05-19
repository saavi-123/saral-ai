export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const trackingId = searchParams.get("trackingId");

  const res = await fetch(
    `${process.env.STRAPI_URL}/api/tracking-sessions`
  );
  const data = await res.json();

  const session = (data.data || []).find(
    s => s.tracking_link?.includes(trackingId)
  );

  if (!session) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Only return what the frontend needs — never expose internal IDs or full data
  return Response.json({
    found: true,
    decoy_url: session.decoy_url,
    documentId: session.documentId
  });
}