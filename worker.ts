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

    const securityHeaders: Record<string, string> = {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://portal.jawafdehi.org https://jawafdehi.org https://nes.jawafdehi.org https://api.jawafdehi.org;",
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };

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
            ...securityHeaders,
          },
        });
      }
    }

    // Try to serve pre-rendered static asset
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      const response = new Response(asset.body, asset);
      for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value);
      }
      return response;
    }

    // SPA fallback: serve index.html with 200
    if (request.method !== 'GET' && request.method !== 'HEAD') return asset;
    const indexRequest = new Request(new URL('/', request.url).toString(), request);
    const indexResponse = await env.ASSETS.fetch(indexRequest);
    const spaResponse = new Response(indexResponse.body, {
      status: 200,
      headers: indexResponse.headers,
    });
    for (const [key, value] of Object.entries(securityHeaders)) {
      spaResponse.headers.set(key, value);
    }
    return spaResponse;
  },
};
