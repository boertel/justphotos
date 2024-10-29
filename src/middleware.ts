async function cachingMiddleware(context, next) {
  const { request, locals } = context;
  if (request.method !== "GET") {
    return next();
  }
  // caches.default is only available on cloudflare workers
  // other platforms implementing the Web Cache API require using the `open` method
  // `const cache = await caches.open("default")`
  const {
    caches,
    ctx: { waitUntil },
  } = locals.runtime;
  const cache = caches.default;

  const cachedResponse = await cache.match(request.url);
  console.log("match", request.url, cachedResponse);

  // return the cached response if there was one
  if (cachedResponse) {
    return cachedResponse;
  } else {
    // render a fresh response
    const response = await next();

    // add to cache
    console.log("put", request.url);
    console.log(
      "waitUntil",
      waitUntil(cache.put(request.url, response.clone())),
    );

    // return fresh response
    return response;
  }
}

export const onRequest = cachingMiddleware;
