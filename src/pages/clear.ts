import type { APIContext } from "astro";

function createRequest(request: Request, pathname: string) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url);
}

export async function POST({ request, locals }: APIContext) {
  const {
    env: { API_KEY },
    caches,
  } = locals.runtime;

  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const pages = [createRequest(request, "/from/ben")];
  return new Response(
    // @ts-ignore
    (await Promise.all(pages.map((page) => caches.default.delete(page)))).join(
      " ",
    ),
  );
}
