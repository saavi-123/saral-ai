export async function POST(req) {
  try {
    const formData = await req.formData();

    console.log("Upload route hit — forwarding to Strapi");

    const res = await fetch(
      `${process.env.STRAPI_URL}/api/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const text = await res.text();
    console.log("Strapi upload response status:", res.status);
    console.log("Strapi upload response body:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({ error: "Strapi returned non-JSON" }, { status: 500 });
    }

    if (Array.isArray(data) && data[0]?.url) {
      return Response.json({ url: data[0].url });
    }

    return Response.json({ error: "Upload failed", strapiResponse: data }, { status: 400 });

  } catch (err) {
    console.error("Upload proxy error:", err);
    return Response.json({ error: "Server error", message: err.message }, { status: 500 });
  }
}