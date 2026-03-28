process.env.SSR = 'true';

import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface RouteConfig {
  path: string;
  outFile: string;
}

interface RenderResult {
  html: string;
  helmetContext: { helmet?: { title?: { toString(): string }; meta?: { toString(): string } } };
  dehydratedState: unknown;
}

interface PaginatedCaseList {
  count: number;
  next: string | null;
  results: Array<{
    id: number;
    updated_at: string;
    entities: Array<{ nes_id: string | null }>;
  }>;
}

const API_BASE = 'https://portal.jawafdehi.org/api';
const CONCURRENCY = 5;

async function fetchAllCases(): Promise<PaginatedCaseList['results']> {
  const all: PaginatedCaseList['results'] = [];
  let url: string | null = `${API_BASE}/cases/`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status} fetching ${url}`);
    const data: PaginatedCaseList = await res.json();
    all.push(...data.results);
    url = data.next;
  }
  return all;
}

async function withConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

async function writeHtml(outFile: string, content: string): Promise<void> {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, content, 'utf-8');
}

function injectIntoTemplate(template: string, result: RenderResult): string {
  const { html, helmetContext, dehydratedState } = result;
  const title = helmetContext.helmet?.title?.toString() ?? '';
  const meta = helmetContext.helmet?.meta?.toString() ?? '';
  const json = JSON.stringify(dehydratedState).replace(/<\//g, '<\\/');
  const stateScript = `<script id="__REACT_QUERY_STATE__" type="application/json">${json}</script>`;

  return template
    .replace('<!--app-html-->', html)
    .replace('<!--helmet-title-->', title)
    .replace('<!--helmet-meta-->', meta)
    .replace('<!--dehydrated-state-->', stateScript);
}

async function main() {
  // Read template
  const templatePath = join(ROOT, 'dist/client/index.html');
  let template: string;
  try {
    template = await readFile(templatePath, 'utf-8');
  } catch {
    console.error(`[pre-render] ERROR: Template not found at ${templatePath}`);
    process.exit(1);
  }

  // Dynamic import of SSR bundle (built by `vite build --ssr`, not available at type-check time)
  // @ts-expect-error -- entry-server.js is generated at build time, not resolvable during type-checking
  const { render } = await import('../dist/server/entry-server.js') as {
    render: (url: string) => Promise<RenderResult>;
  };

  // Static routes
  const staticRoutes: RouteConfig[] = [
    { path: '/', outFile: join(ROOT, 'dist/index.html') },
    { path: '/about', outFile: join(ROOT, 'dist/about/index.html') },
    { path: '/cases', outFile: join(ROOT, 'dist/cases/index.html') },
    { path: '/entities', outFile: join(ROOT, 'dist/entities/index.html') },
    { path: '/updates', outFile: join(ROOT, 'dist/updates/index.html') },
    { path: '/information', outFile: join(ROOT, 'dist/information/index.html') },
    { path: '/feedback', outFile: join(ROOT, 'dist/feedback/index.html') },
    { path: '/report', outFile: join(ROOT, 'dist/report/index.html') },
  ];

  // Fetch cases and entity IDs
  let cases: PaginatedCaseList['results'] = [];
  let apiReachable = true;
  try {
    cases = await fetchAllCases();
    console.log(`[pre-render] Fetched ${cases.length} cases`);
  } catch (err) {
    console.warn('[pre-render] WARNING: API unreachable, rendering static routes only:', err);
    apiReachable = false;
  }

  // Collect unique entity IDs
  const entityIds = apiReachable
    ? [...new Set(cases.flatMap(c => c.entities.map(e => e.nes_id).filter((id): id is string => id != null)))]
    : [];

  // Render static routes
  for (const route of staticRoutes) {
    try {
      const result = await render(route.path);
      const html = injectIntoTemplate(template, result);
      await writeHtml(route.outFile, html);
      console.log(`[pre-render] ✓ ${route.path} → ${route.outFile}`);
    } catch (err) {
      console.error(`[pre-render] ERROR rendering ${route.path}:`, err);
      if (err instanceof Error) console.error(err.stack);
    }
  }

  if (!apiReachable) {
    console.log('[pre-render] Skipping dynamic routes (API unreachable)');
    return;
  }

  // Render case routes
  await withConcurrency(cases, CONCURRENCY, async (caseItem) => {
    const path = `/case/${caseItem.id}`;
    const outFile = join(ROOT, `dist/case/${caseItem.id}/index.html`);
    try {
      const result = await render(path);
      const html = injectIntoTemplate(template, result);
      await writeHtml(outFile, html);
      console.log(`[pre-render] ✓ ${path}`);
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404) {
        try {
          const result = await render('/not-found');
          const html = injectIntoTemplate(template, result);
          await writeHtml(outFile, html);
          console.log(`[pre-render] ✓ ${path} (404 → NotFound)`);
        } catch (e) {
          console.error(`[pre-render] ERROR rendering NotFound for ${path}:`, e);
          if (e instanceof Error) console.error(e.stack);
        }
      } else if (status && status >= 500) {
        console.warn(`[pre-render] WARNING: Skipping ${path} (${status}):`, err);
      } else {
        console.error(`[pre-render] ERROR rendering ${path}:`, err);
        if (err instanceof Error) console.error(err.stack);
      }
    }
  });

  // Render entity routes
  await withConcurrency(entityIds, CONCURRENCY, async (entityId) => {
    const path = `/entity/${entityId}`;
    const outFile = join(ROOT, `dist/entity/${entityId}/index.html`);
    try {
      const result = await render(path);
      const html = injectIntoTemplate(template, result);
      await writeHtml(outFile, html);
      console.log(`[pre-render] ✓ ${path}`);
    } catch (err) {
      console.warn(`[pre-render] WARNING: Skipping entity ${entityId}:`, err);
      if (err instanceof Error) console.error(err.stack);
    }
  });

  console.log('[pre-render] Done.');
}

main().catch((err) => {
  console.error('[pre-render] Fatal error:', err);
  process.exit(1);
});
