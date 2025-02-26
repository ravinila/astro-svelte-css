import { sequence } from "astro:middleware";

import { cssInjector } from "./css-injector";

export const onRequest = sequence(
  // Serve static files first,
  cssInjector
);
