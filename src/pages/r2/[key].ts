import type { APIContext } from "astro";

import { cache, CachedResponse } from "../../utils";

export async function GET({ request, params: { key }, locals }: APIContext) {
  return await cache({ request, locals }, async ({ R2 }) => {
    const object = await R2.get(key);
    if (!object) {
      throw new Error(`Object not found: ${key}`);
    }
    return new CachedResponse(await object.arrayBuffer(), {
      headers: {
        etag: object.httpEtag,
      },
    });
  });
}
