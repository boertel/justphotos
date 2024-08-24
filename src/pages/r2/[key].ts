import type { APIContext } from "astro";

export async function GET({ request, params: { key }, locals }: APIContext) {
  const {
    env: { R2 },
    caches,
    ctx,
  } = locals.runtime;

  const cache = caches.default;

  const url = new URL(request.url);
  const cacheKey = new Request(url.toString(), request);

  //@ts-ignore
  let cacheResponse = await cache.match(cacheKey);
  if (cacheResponse) {
    console.log(`Cache hit for ${key}`);
    return cacheResponse;
  }
  console.log(`Cache miss for ${key}`);
  const object = await R2.get(key);
  if (object === null) {
    return new Response("Not Found", { status: 404 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.append("Cache-Control", "s-maxage=10, immutable");

  const data = await object.arrayBuffer();
  const response = new Response(data, { headers });

  //@ts-ignore
  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}
