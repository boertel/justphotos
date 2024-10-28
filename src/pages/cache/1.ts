import type { APIContext } from "astro";

export async function GET({ request }: APIContext) {
  return new Response(`${new Date().toLocaleString()}<a href="/2">2</a>`, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": `public, max-age=10, s-maxage=20`,
    },
  });
}
