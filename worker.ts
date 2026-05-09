import { LEGACY_CASE_MAP } from './src/utils/legacyCaseMap';

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle legacy numeric case redirects (301)
    const caseMatch = path.match(/^\/case\/(\d+)\/?$/);
    if (caseMatch) {
      const legacyId = caseMatch[1];
      const targetSlug = LEGACY_CASE_MAP[legacyId];
      if (targetSlug) {
        return new Response(null, {
          status: 301,
          headers: {
            'Location': `/case/${targetSlug}`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Try to serve pre-rendered static asset
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    // SPA fallback: serve index.html with 200
    if (request.method !== 'GET' && request.method !== 'HEAD') return asset;
    const indexRequest = new Request(new URL('/', request.url).toString(), request);
    const indexResponse = await env.ASSETS.fetch(indexRequest);
    return new Response(indexResponse.body, {
      status: 200,
      headers: indexResponse.headers,
    });
  },
};