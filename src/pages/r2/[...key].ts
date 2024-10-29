import type { APIContext } from "astro";
import { cacheHeader } from "pretty-cache-header";

export async function GET({ request, params: { key }, locals }: APIContext) {
  const object = await locals.runtime.env.R2.get(key);
  if (!object) {
    throw new Error(`Object not found: ${key}`);
  }
  return new Response(await object.arrayBuffer(), {
    headers: {
      "Cache-Control": cacheHeader({
        public: true,
        maxAge: "5min",
        sMaxage: "1week",
      }),
      "Content-Type": object.customMetadata.contentType,
      etag: object.httpEtag,
    },
  });
}
