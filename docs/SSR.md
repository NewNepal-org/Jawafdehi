# Server-Side Rendering (SSR) Implementation

## Overview

This document describes the Server-Side Rendering (SSR) implementation for the Jawafdehi frontend application. SSR improves initial page load performance, SEO, and provides better user experience by pre-rendering HTML on the server.

## Architecture

The SSR implementation uses Vite's built-in SSR capabilities with the following components:

### Key Files

1. **`src/entry-server.tsx`** - Server-side entry point that renders React components to HTML strings
2. **`src/main.tsx`** - Client-side entry point that hydrates the server-rendered HTML
3. **`src/App.tsx`** - Router-agnostic App component that works with both BrowserRouter (client) and StaticRouter (server)
4. **`scripts/prerender.ts`** - Build-time script that generates static HTML files for specified routes
5. **`vite.config.ts`** - Vite configuration with SSR build support

### Pages Pre-rendered

The following pages are pre-rendered during the SSR build:

- `/` (Home page) - with cases and statistics data
- `/about` (About page)
- `/information` (Information page)

## Build Process

### Regular Build (Client-Side Only)

```bash
npm run build
```

This creates a standard client-side build in the `dist/` directory (default Vite behavior).

### SSR Build

```bash
npm run build:ssr
```

This executes three steps:

1. **Client Build** (`npm run build:ssr:client`)
   - Builds the client bundle with hydration support
   - Output: `dist/client/`

2. **Server Build** (`npm run build:ssr:server`)
   - Builds the SSR server bundle
   - Output: `dist/server/entry-server.js`

3. **Prerender** (`npm run prerender`)
   - Executes the prerender script
   - Generates static HTML files for specified routes
   - Injects server-rendered HTML and React Query state into templates

### Build Output

After running `npm run build:ssr`, you'll have:

```
dist/
├── client/                 # Client-side assets
│   ├── index.html         # Pre-rendered home page
│   ├── about/
│   │   └── index.html     # Pre-rendered about page
│   ├── information/
│   │   └── index.html     # Pre-rendered information page
│   └── assets/            # JS, CSS bundles
└── server/
    └── entry-server.js    # SSR rendering function
```

## How It Works

### Server-Side Rendering Flow

1. **Build Time (Prerendering)**:
   - The `prerender.ts` script imports the server entry point
   - For each route, it:
     - Creates a new QueryClient
     - Renders the React app to an HTML string using `renderToString`
     - Dehydrates the React Query state
     - Injects the HTML and state into the template
     - Writes the final HTML to disk

2. **Client-Side Hydration**:
   - Browser loads the pre-rendered HTML (instant visible content)
   - React hydrates the existing DOM nodes
   - React Query rehydrates from the `__REACT_QUERY_STATE__` window variable
   - App becomes interactive without a full re-render

### React Query State Management

- **Server**: `dehydrate(queryClient)` serializes the query cache
- **Client**: `HydrationBoundary` component rehydrates the cache
- State is passed via `window.__REACT_QUERY_STATE__`

### Routing

- **Client**: Uses `BrowserRouter` for browser history API
- **Server**: Uses `StaticRouter` for static rendering
- **App Component**: Router-agnostic, receives routing from parent

## Configuration

### Environment Variables

No special environment variables required. The SSR build is triggered by:
- Setting `VITE_SSR_BUILD=true` for the server build
- Using `--ssr` flag in Vite CLI

### Vite Configuration

The `vite.config.ts` detects SSR builds via `process.env.VITE_SSR_BUILD`:

```typescript
const isSSRBuild = process.env.VITE_SSR_BUILD === 'true';

build: isSSRBuild ? {
  ssr: true,
  outDir: 'dist/server',
  rollupOptions: {
    input: './src/entry-server.tsx',
  },
} : undefined
```

## Adding New Pages to SSR

To add a new page for pre-rendering:

1. Open `scripts/prerender.ts`
2. Add the route to the `pagesToPrerender` array:

```typescript
const pagesToPrerender = [
  { url: '/' },
  { url: '/about' },
  { url: '/information' },
  { url: '/your-new-page' },  // Add here
];
```

3. Run `npm run build:ssr`

## Data Prefetching (Future Enhancement)

Currently, pages are pre-rendered with empty data (loading states). To add data prefetching:

1. Update `scripts/prerender.ts` to prefetch data before rendering
2. Use `queryClient.prefetchQuery()` for each page's data requirements
3. Ensure API environment variables are available in the Node.js environment

Example:

```typescript
if (page.url === '/') {
  await queryClient.prefetchQuery({
    queryKey: ['cases', { page: 1 }],
    queryFn: () => getCases({ page: 1 }),
  });
}
```

## Deployment

### Static Hosting (GitHub Pages, Netlify, Vercel)

1. Build with SSR: `npm run build:ssr`
2. Deploy the `dist/client` directory
3. Configure rewrites to serve `index.html` for SPA routes

### Server-Side Rendering (Node.js Server)

For true SSR (not just prerendering):

1. Set up a Node.js server (Express, Fastify, etc.)
2. Import `dist/server/entry-server.js`
3. Call the `render()` function for each request
4. Serve the generated HTML

## Performance Benefits

- **Faster First Contentful Paint (FCP)**: HTML is rendered immediately
- **Better SEO**: Search engines see fully-rendered content
- **Progressive Enhancement**: Works even if JavaScript fails to load
- **Reduced Time to Interactive (TTI)**: React hydrates instead of mounting

## Limitations

1. **Static Generation**: Currently uses build-time prerendering, not runtime SSR
2. **No Data Prefetching**: Data is fetched client-side (can be enhanced)
3. **Limited Routes**: Only specified routes are pre-rendered
4. **Build Time**: SSR build takes slightly longer than client-only build

## Troubleshooting

### "document is not defined" Error

Ensure you're not using browser-only APIs in components that render server-side. Use:

```typescript
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

### Hydration Mismatch

If you see hydration warnings:
- Ensure server and client render the same initial HTML
- Check for randomness or timestamps in initial render
- Verify conditional rendering is consistent

### Build Failures

- Check that all imports are compatible with Node.js (no browser-only modules)
- Ensure `tsx` is installed as a dev dependency
- Verify `type: "module"` is set in `package.json`

## Future Enhancements

1. **Data Prefetching**: Add API data fetching during prerendering
2. **Incremental Static Regeneration (ISR)**: Update pre-rendered pages periodically
3. **Streaming SSR**: Use React 18's streaming capabilities
4. **Edge Rendering**: Deploy SSR function to edge workers (Cloudflare, Vercel Edge)
5. **Partial Hydration**: Hydrate only interactive components
6. **Automatic Route Discovery**: Detect routes automatically instead of manual configuration

## References

- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)
- [React Server Components](https://react.dev/reference/react/components#server-components)
- [React Query SSR](https://tanstack.com/query/latest/docs/react/guides/ssr)
