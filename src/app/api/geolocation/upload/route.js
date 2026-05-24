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

    const text = await res.text();

    return Response.json({
      frontendStatus: res.status,
      rawResponse: text
    });

  } catch (err) {
    return Response.json({
      error: "Server error",
      message: err.message
    }, { status: 500 });
  }
}