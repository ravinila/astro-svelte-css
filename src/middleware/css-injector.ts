import { defineMiddleware } from 'astro:middleware';
import path from 'path';
import { readFile } from 'fs/promises';
import { componentTracker } from '../utils';

const externalCss = true;
const clientPath = path.join(process.cwd(), 'dist', 'client');
const cssManifestPath = path.join(clientPath, 'css-manifest.json');

let cssManifest: Record<string, string> = {};
const cssManifestContentCache: Record<string, string> = {};

const base = import.meta.env.BASE_URL; // get the base from astro.config.mjs

try {
  const manifest = await readFile(cssManifestPath, 'utf-8');
  cssManifest = JSON.parse(manifest);

  for (const key of Object.keys(cssManifest)) {
    const filePath = cssManifest[key];
    const css = await readFile(
      path.join(clientPath, filePath as string),
      'utf-8'
    );
    cssManifestContentCache[key] = css;
  }
  console.log('CSS Manifest:', cssManifest);
} catch (error) {
  console.error('Failed to read CSS manifest:', error);
}

export const cssInjector = defineMiddleware(async (context, next) => {
  const isProd = import.meta.env.MODE === 'production';
  const response = await next();

  if (!isProd) {
    console.log('Not in production, skipping CSS injection');
    return response;
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) {
    console.log('Not HTML, skipping CSS injection');
    return response;
  }

  console.log('!!!!componentTracker.usedComponents', componentTracker.getComponents())
  const usedComponents = componentTracker.getComponents() || [];

  let cssList: string[] = [];
  context.locals.isCssExternal = externalCss;

  if (externalCss) {
    cssList = usedComponents
      .map((component: string) => cssManifest[component])
      .filter(Boolean) as string[];
  } else {
    cssList = usedComponents
      .map((component: string) => cssManifestContentCache[component])
      .filter(Boolean) as string[];
  }
  context.locals.cssList = cssList;

  const html = await response.text();
  if (!html.includes('</head>')) {
    console.log('No </head> tag found, skipping injection');
    return new Response(html, {
      status: response.status,
      headers: response.headers,
    });
  }

  let cssContent = '';
  if (externalCss) {
    cssContent = cssList
      .map(
        (cssFile: string) =>
          `<link rel="stylesheet" href="${cssFile}" />`
      )
      .join('\n');
  } else {
    cssContent = `<style>${cssList.join('\n')}</style>`;
  }

  const modifiedHtml = html.replace('</head>', `${cssContent}</head>`);
  return new Response(modifiedHtml, {
    status: response.status,
    headers: response.headers,
  });
});
