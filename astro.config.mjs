import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  redirects: {
    "/": "/from/ben",
  },
  security: {
    checkOrigin: false,
  },
  integrations: [tailwind()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
