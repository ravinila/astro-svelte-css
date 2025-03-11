import { defineMiddleware } from "astro:middleware";
import path from "path";
import { readFile } from "fs/promises";

const externalCss = true;

const clientPath = path.join(process.cwd(), "dist", "client");
const cssManifestPath = path.join(clientPath, "css-manifest.json");

let cssManifest: Record<string, string> = {};
let cssManifestContentCache: Record<string, string> = {};

try {
  const manifest = await readFile(cssManifestPath, "utf-8");
  cssManifest = JSON.parse(manifest);

  for (const key of Object.keys(cssManifest)) {
    const css = await readFile(
      path.join(clientPath, cssManifest[key]),
      "utf-8"
    );

    console.log({ css });
    cssManifestContentCache[key] = css;
  }

  console.log({ cssManifestContentCache });
  console.log("CSS Manifest:", cssManifest);
} catch (error) {
  console.error("Failed to read CSS manifest:", error);
}

export const cssInjector = defineMiddleware(async (context, next) => {
  console.log("[css-injector] Middleware triggered for:", context.url.pathname);

  const isProd = import.meta.env.MODE === "production";
  console.log(
    `[css-injector] Running in ${isProd ? "Production" : "Development"} Mode`
  );

  const response = await next();

  if (!isProd) {
    return response;
  }

  // Get components used for this route
  const pathname = context.url.pathname;

  const usedComponents = context.locals.usedComponents || [];
  console.log(
    "[css-injector] Used components for",
    pathname,
    ":",
    usedComponents
  );

  let cssList = [];
  context.locals.isCssExternal = externalCss;
  if (externalCss) {
    // Map to CSS files from manifest
    cssList = usedComponents
      .map((component: string) => cssManifest[component])
      .filter(Boolean);
    console.log("[css-injector] CSS links inject:", cssList);
  } else {
    // Map to CSS files from Cache
    cssList = usedComponents
      .map((component: string) => cssManifestContentCache[component])
      .filter(Boolean);
    console.log("[css-injector] CSS embed inject:", cssList);
  }
  context.locals.cssList = cssList;

  // Get the response from the next middleware/page

  // Modify the HTML response
  const html = await response.text();
  // if (html.includes("</head>")) {
  //   const cssLinks = cssFiles
  //     .map((cssFile) => `<link rel="stylesheet" href="${cssFile}">`)
  //     .join("\n");
  //   console.log("[css-injector] Injecting CSS links:", cssLinks);
  //   const modifiedHtml = html.replace("</head>", `${cssLinks}</head>`);
  //   return new Response(modifiedHtml, {
  //     status: response.status,
  //     headers: response.headers,
  //   });
  // }

  if (html.includes("</head>")) {
    let cssContent = "";
    if (externalCss) {
      cssContent = cssList
        .map((cssFile: string) => `<link rel="stylesheet" href="${cssFile}">`)
        .join("\n");
    } else {
      cssContent = `<style>${cssList
        .map((cssStyle: string) => cssStyle)
        .join("\n")}</style>`;
    }
    console.log("[css-injector] Injecting CSS:", cssContent);
    const modifiedHtml = html.replace("</head>", `${cssContent}</head>`);
    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers,
    });
  }

  return response;
});
