import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import worker from '../../worker';

// Feature: ssr-seo, Property 13: Worker returns correct pre-rendered HTML for known routes
// Feature: ssr-seo, Property 14: Worker returns 200 SPA shell for unknown routes

/**
 * Validates: Requirements 11.3
 */
describe('Property 13: Worker returns correct pre-rendered HTML for known routes', () => {
  it('returns the asset response as-is when ASSETS.fetch returns non-404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        fc.integer({ min: 200, max: 399 }),
        fc.string(),
        async (url, status, body) => {
          const request = new Request(url);
          const assetResponse = new Response(body, { status });
          const env = {
            ASSETS: {
              fetch: async (_req: Request) => assetResponse,
            },
          };

          const result = await worker.fetch(request, env);
          expect(result.status).toBe(status);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 11.4
 */
describe('Property 14: Worker returns 200 SPA shell for unknown routes', () => {
  it('returns 200 with index.html body when ASSETS.fetch returns 404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        fc.string(),
        async (url, indexBody) => {
          const request = new Request(url);
          const indexResponse = new Response(indexBody, {
            status: 200,
            headers: { 'content-type': 'text/html' },
          });

          const env = {
            ASSETS: {
              fetch: async (req: Request) => {
                const reqUrl = new URL(req.url);
                if (reqUrl.pathname === '/') return indexResponse;
                return new Response('Not Found', { status: 404 });
              },
            },
          };

          const result = await worker.fetch(request, env);
          expect(result.status).toBe(200);
          const text = await result.text();
          expect(text).toBe(indexBody);
        }
      ),
      { numRuns: 100 }
    );
  });
});
