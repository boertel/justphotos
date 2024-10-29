async function cachingMiddleware(context, next) {
  const { request, locals } = context;
  if (request.method !== "GET") {
    return next();
  }

  const {
    caches,
    ctx: { waitUntil },
  } = locals.runtime;
  const cache = caches.default;

  const cachedResponse = await cache.match(request.url);

  if (cachedResponse) {
    console.log("Cache HIT for", request.url);
    return cachedResponse;
  } else {
    const response = await next();

    const cloned = response.clone();
    cloned.headers.delete("X-Astro-Route-Type");
    waitUntil(cache.put(request.url, cloned));
    console.log("Cache MISS for", request.url);

    return response;
  }
}

export const onRequest = cachingMiddleware;
