import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";

const ORIGIN = process.env.BOOKING_API_ORIGIN ?? "https://www.solution8.ai";
const ALLOWED = new Set(["availability", "lead", "meeting"]);

async function proxy(req: HttpRequest): Promise<HttpResponseInit> {
  const path = (req.params.path ?? "").split("/")[0];
  if (!ALLOWED.has(path)) return { status: 404, jsonBody: { error: "not-found" } };

  const search = new URL(req.url).search;
  const method = req.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await req.text();

  try {
    const res = await fetch(`${ORIGIN}/api/${path}${search}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await res.text();
    return {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
      body: text,
    };
  } catch (e) {
    console.error("booking proxy failed", e);
    return { status: 502, jsonBody: { error: "proxy-failed" } };
  }
}

app.http("booking-proxy", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "{*path}",
  handler: proxy,
});
