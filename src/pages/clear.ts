import type { APIContext } from "astro";

export async function POST({ request, locals }: APIContext) {
  const {
    env: { API_KEY },
    caches,
  } = locals.runtime;

  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const pages = [new Request("https://justphotos.pages.dev/from/ben")];
  return new Response(
    // @ts-ignore
    (await Promise.all(pages.map((page) => caches.default.delete(page)))).join(
      " ",
    ),
  );
}
