export async function POST(req) {
  try {
    const body = await req.json();

    const API_URL = process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_API_URL
      : "http://localhost:3001/api/generate-email";

    const apiRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!apiRes.ok) {
      const err = await apiRes.json();
      return new Response(JSON.stringify({ error: err.error || "API error" }), {
        status: apiRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(apiRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (err) {
    console.error("Proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Could not reach the API server. Is it running?" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}