import { sequence } from "astro:middleware";
import { cssInjector } from "./css-injector";
import { serveStaticFiles } from "./serve-static-files";

console.log("process.cwd()", process.cwd());

export const onRequest = sequence(
  // Serve static files first

  serveStaticFiles,
  cssInjector
);
