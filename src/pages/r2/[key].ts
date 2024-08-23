import type { APIContext } from "astro";

export async function GET({ request, params, locals }: APIContext) {
  const { R2 } = locals.runtime.env;
  const object = await R2.get(params.key);
  const data = await object.arrayBuffer();
  return new Response(data);
}
