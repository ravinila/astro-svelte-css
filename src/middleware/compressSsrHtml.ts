import { brotliCompressSync, gzipSync, deflateSync } from 'node:zlib';
import { defineMiddleware } from 'astro:middleware';

export const getCompressor = (encoding: string) => {
  switch (encoding) {
    case 'br':
      return (data: string | Buffer) => brotliCompressSync(Buffer.from(data));
    case 'gzip':
      return (data: string | Buffer) => gzipSync(Buffer.from(data));
    case 'deflate':
      return (data: string | Buffer) => deflateSync(Buffer.from(data));
    default:
      return null;
  }
};

export const compressSsrHtml = defineMiddleware(async (context, next) => {
  const response = await next();
  const html = await response.text();
  const headers = new Headers(response.headers);

  if (headers.get('Content-Type')?.includes('text/html')) {
    const acceptEncoding = context.request.headers.get('accept-encoding') || '';
    let encoding: string | null = null;

    if (acceptEncoding.includes('br')) encoding = 'br';
    else if (acceptEncoding.includes('gzip')) encoding = 'gzip';
    else if (acceptEncoding.includes('deflate')) encoding = 'deflate';

    if (encoding) {
      const compressor = getCompressor(encoding);
      if (compressor) {
        const compressed = compressor(html);
        headers.set('content-encoding', encoding);
        headers.delete('content-length');
        return new Response(compressed, {
          status: response.status,
          headers,
        });
      }
    }
  }

  return response;
});
