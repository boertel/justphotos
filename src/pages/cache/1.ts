import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  return new Response("1", {
    headers: {
      "Cache-Control": `public, max-age=10, s-maxage=20`,
    },
  });
}
