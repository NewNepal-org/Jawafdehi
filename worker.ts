import { LEGACY_CASE_MAP } from './src/utils/legacyCaseMap';

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const JDS_API_BASE = 'https://portal.jawafdehi.org/api';

function securityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://portal.jawafdehi.org https://jawafdehi.org https://nes.jawafdehi.org https://api.jawafdehi.org;",
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

function securityHeadersAllowFrame(): Record<string, string> {
  const headers = securityHeaders();
  delete headers['X-Frame-Options'];
  return headers;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function extractCaseSlugFromUrl(caseUrl: string): string | null {
  try {
    const parsed = new URL(caseUrl);
    const match = parsed.pathname.match(/^\/case\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

async function handleOembed(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return jsonResponse({ error: 'Missing url parameter' }, 400);
  }

  const slug = extractCaseSlugFromUrl(targetUrl);
  if (!slug) {
    return jsonResponse({ error: 'Invalid case URL. Expected format: https://jawafdehi.org/case/{slug}' }, 400);
  }

  try {
    const apiUrl = `${JDS_API_BASE}/cases/${encodeURIComponent(slug)}/`;
    const apiResponse = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!apiResponse.ok) {
      return jsonResponse({ error: 'Case not found' }, 404);
    }

    const caseData = await apiResponse.json() as Record<string, unknown>;
    const caseUrl = `https://jawafdehi.org/case/${slug}`;
    const embedUrl = `https://jawafdehi.org/embed/case/${slug}`;
    const title = (caseData.title as string) || 'Untitled Case';

    return jsonResponse({
      type: 'rich',
      version: '1.0',
      title,
      author_name: 'Jawafdehi',
      author_url: 'https://jawafdehi.org',
      provider_name: 'Jawafdehi',
      provider_url: 'https://jawafdehi.org',
      cache_age: 86400,
      thumbnail_url: (caseData.thumbnail_url as string) || (caseData.banner_url as string) || null,
      html: `<iframe src="${embedUrl}" width="480" height="360" frameborder="0" title="${title}" style="max-width:100%;overflow:hidden;border:none;border-radius:8px" allowfullscreen></iframe>`,
      width: 480,
      height: 360,
    });
  } catch {
    return jsonResponse({ error: 'Failed to fetch case data' }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle oEmbed endpoint
    if (path === '/oembed') {
      return handleOembed(request);
    }

    const isEmbedRoute = /^\/embed\/case\//.test(path);
    const secHeaders = isEmbedRoute ? securityHeadersAllowFrame() : securityHeaders();

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
            ...secHeaders,
          },
        });
      }
    }

    // Try to serve pre-rendered static asset
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      const response = new Response(asset.body, asset);
      for (const [key, value] of Object.entries(secHeaders)) {
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
    for (const [key, value] of Object.entries(secHeaders)) {
      spaResponse.headers.set(key, value);
    }
    return spaResponse;
  },
};
