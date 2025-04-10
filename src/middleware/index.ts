import { sequence } from 'astro:middleware';
import { compressSsrHtml } from './compressSsrHtml';
import { cssInjector } from './css-injector';
import { serveAssets } from './serveAssets';

export const onRequest = sequence(serveAssets, compressSsrHtml, cssInjector);
