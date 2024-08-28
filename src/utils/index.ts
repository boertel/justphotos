export async function cache({ request, locals }, callback) {
  const {
    env: { R2 },
    caches,
    ctx,
  } = locals.runtime;

  const _cache = caches.default;

  const url = new URL(request.url);
  const cacheKey = new Request(url.toString(), request);

  //@ts-ignore
  let cacheResponse = await _cache.match(cacheKey);
  if (cacheResponse) {
    console.log(`Cache hit for ${cacheKey.url.toString()}`);
    return cacheResponse;
  }
  console.log(`Cache miss for ${cacheKey.url.toString()}`);

  try {
    const response = await callback({ R2 });

    //@ts-ignore
    ctx.waitUntil(_cache.put(cacheKey, response.clone()));
    return response;
  } catch (exception) {
    console.error(exception);
    return new Response(exception.message, { status: 404 });
  }
}

export class CachedResponse extends Response {
  constructor(body, options = { headers: {} }) {
    const formattedBody =
      body instanceof ArrayBuffer ? body : JSON.stringify(body);
    super(formattedBody, {
      headers: {
        ...options.headers,
        "Cache-Control": "public, maxage=3600, s-maxage=3600, immutable",
      },
    });
  }
}
