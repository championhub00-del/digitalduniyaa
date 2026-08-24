export async function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    return new Response("IndexNow key not configured", { status: 404 });
  }
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
