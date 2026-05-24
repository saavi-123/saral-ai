export async function POST(req) {
  try {
    const formData = await req.formData();

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (Array.isArray(data) && data[0]?.url) {
      return Response.json({ url: data[0].url });
    }

    return Response.json({ error: "Upload failed" }, { status: 400 });

  } catch (err) {
    console.error("Upload proxy error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}