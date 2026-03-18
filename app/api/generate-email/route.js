export async function POST(req) {
  try {
    const body = await req.json();

    const apiRes = await fetch("http://localhost:5000/api/generate-email", {
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