import fs from 'node:fs/promises';
import path from 'node:path';
import type { MiddlewareHandler } from 'astro';

export const serveAssets: MiddlewareHandler = async (context, next) => {
  const { pathname } = new URL(context.request.url);

  // Match only requests starting with /_astro/assets/
  if (pathname.startsWith('/_astro/assets/')) {
    const relativePath = pathname.replace('/_astro/assets/', '');
    const filePath = path.resolve('dist/client/_astro/assets', relativePath);

    try {
      const file = await fs.readFile(filePath);
      const ext = path.extname(filePath);

      return new Response(file, {
        status: 200,
        headers: {
          'Content-Type': getContentType(ext),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return new Response('Asset not found', { status: 404 });
    }
  }

  return next();
};

function getContentType(ext: string): string {
  return {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.map': 'application/octet-stream',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  }[ext] ?? 'application/octet-stream';
}