interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Try to serve pre-rendered static asset
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    // SPA fallback: serve index.html with 200
    const indexRequest = new Request(new URL('/', request.url).toString(), request);
    const indexResponse = await env.ASSETS.fetch(indexRequest);
    return new Response(indexResponse.body, {
      status: 200,
      headers: indexResponse.headers,
    });
  },
};
