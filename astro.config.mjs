// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

import svelte from "@astrojs/svelte";

export default defineConfig({
  integrations: [svelte()],
  output: "server", // Switch from 'static' to 'server'
  server: {
    port: 5000,
  },
  adapter: node({ mode: "standalone" }), // Use Node.js adapter
});
