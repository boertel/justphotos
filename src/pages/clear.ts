import type { CacheStorage } from "@cloudflare/workers-types";
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

  const formData = await request.formData();
  const pages = ["/from/ben", ...(formData.getAll("page") as string[])].map(
    (page) => {
      return createRequest(request, page);
    },
  );
  return new Response(
    JSON.stringify(
      await Promise.all(pages.map((page) => clearCache(caches, page))),
    ),
  );
}

async function clearCache(caches: CacheStorage, page: Request) {
  return {
    page: page.url,
    // @ts-ignore
    cleared: await caches.default.delete(page),
  };
}
