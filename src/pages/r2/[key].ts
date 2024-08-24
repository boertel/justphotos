import type { APIContext } from "astro";

export async function GET({ params: { key }, locals }: APIContext) {
  const {
    env: { R2 },
    caches,
    ctx,
  } = locals.runtime;

  const cache = caches.default;

  let cacheResponse = await cache.match(key);
  if (cacheResponse) {
    return cacheResponse;
  }
  const object = await R2.get(key);
  if (object === null) {
    return new Response("Not Found", { status: 404 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "s-maxage=3600, immutable");

  const data = await object.arrayBuffer();
  const response = new Response(data, { headers });

  ctx.waitUntil(cache.put(key, response.clone()));

  return response;
}
