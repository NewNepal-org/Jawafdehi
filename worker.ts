interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const LEGACY_MAP: Record<string, string> = {
  '238': 'case-081-cr-0060-2bd380',
  '231': 'case-081-cr-0122-special-court-corruption-case--17',
  '230': 'case-081-cr-0022-638531',
  '229': 'case-1006a261fdba-3e596bb7',
  '228': 'case-081-cr-0104-516629',
  '227': 'case-081-cr-0095-teramocs-081-cr-0095-f2b7ea',
  '225': 'case-081-cr-0091-628531',
  '224': 'case-081-cr-0097-728531',
  '221': 'case-081-cr-0046-828531',
  '220': 'case-081-cr-0111-928531',
  '219': 'case-081-cr-0129-a28531',
  '216': 'case-081-cr-0082-b28531',
  '214': 'case-081-cr-0081-c28531',
  '213': 'case-080-cr-0158-d28531',
  '212': 'case-081-cr-0080-e28531',
  '211': 'case-081-cr-0079-f28531',
  '210': 'case-081-cr-0142-028532',
  '209': 'case-081-cr-0098-128532',
  '208': 'case-081-cr-0058-228532',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle legacy numeric case redirects (301)
    const caseMatch = path.match(/^\/case\/(\d+)\/?$/);
    if (caseMatch) {
      const legacyId = caseMatch[1];
      const targetSlug = LEGACY_MAP[legacyId];
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