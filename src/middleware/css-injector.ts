import { defineMiddleware } from "astro:middleware";
// import path from "path";
// import { routeComponentMap } from "../src/components/ComponentMap";

const cssManifest = {
  Login: "/_astro/assets/svelte/Login-7c081551.css",
  Register: "/_astro/assets/svelte/Register-a6faefec.css",
  "common-Footer": "/_astro/assets/svelte/common-Footer-1c72de2f.css",
  Hero: "/_astro/assets/svelte/Hero-7ef988ef.css",
  Header: "/_astro/assets/svelte/Header-844c0186.css",
  Footer: "/_astro/assets/svelte/Footer-c5483db2.css",
};

export const cssInjector = defineMiddleware(async (context, next) => {
  console.log("[css-injector] Middleware triggered for:", context.url.pathname);

  const isProd = import.meta.env.MODE === "production";
  console.log(
    `[css-injector] Running in ${isProd ? "Production" : "Development"} Mode`
  );

  const response = await next();

  console.log("locals", context.locals);
  console.log("userd", context.locals?.usedComponents || "no used components");

  // Get components used for this route
  const pathname = context.url.pathname;
  const usedComponents = ["Header"];
  console.log(
    "[css-injector] Used components for",
    pathname,
    ":",
    usedComponents
  );

  // Map to CSS files from manifest
  const cssFiles = usedComponents
    .map((component) => cssManifest[component])
    .filter(Boolean);
  console.log("[css-injector] CSS files to inject:", cssFiles);

  // Store in locals for potential use elsewhere
  context.locals.cssFiles = cssFiles;

  // Get the response from the next middleware/page

  // Modify the HTML response
  const html = await response.text();
  if (html.includes("</head>")) {
    const cssLinks = cssFiles
      .map((cssFile) => `<link rel="stylesheet" href="${cssFile}">`)
      .join("\n");
    console.log("[css-injector] Injecting CSS links:", cssLinks);
    const modifiedHtml = html.replace("</head>", `${cssLinks}</head>`);
    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers,
    });
  }

  return response;
});
