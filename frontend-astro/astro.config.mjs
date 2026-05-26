import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [react({
    experimentalReactChildren: true,
  }), tailwind()],

  output: "server",
  adapter: node({
    mode: 'middleware',
  }),
});