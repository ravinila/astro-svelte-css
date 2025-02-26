import { defineMiddleware } from "astro:middleware";
import path from "path";
// import express from "express";
import { readFile } from "fs/promises";

// const staticMiddleware = express.static(path.join(process.cwd(), "dist"));

export const serveStaticFiles = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Only intercept requests for `_astro/` static assets
  if (!url.pathname.startsWith("/_astro/")) {
    return next(); // Continue to other routes
  }

  const filePath = path.join(
    import.meta.env.SITE ?? "",
    "dist/client",
    url.pathname
  ); // Assuming `_astro/` is inside `dist/`

  console.log({ filePath });
  try {
    const fileContent = await readFile(filePath);
    const extension = url.pathname.split(".").pop() || "";

    // Set content type based on file extension
    const contentType =
      {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        json: "application/json",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        svg: "image/svg+xml",
        webp: "image/webp",
      }[extension] || "application/octet-stream";

    return new Response(fileContent, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return new Response("File not found", { status: 404 });
  }
});
