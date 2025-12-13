import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QueryClient } from '@tanstack/react-query';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pages to pre-render (without data prefetching for now)
const pagesToPrerender = [
  { url: '/' },
  { url: '/about' },
  { url: '/information' },
];

async function prerender() {
  // Import the server entry after build
  const serverEntryPath = path.resolve(__dirname, '../dist/server/entry-server.js');
  console.log(`Loading server entry from: ${serverEntryPath}`);
  
  const { render } = await import(serverEntryPath);
  
  // Read the client template
  const templatePath = path.resolve(__dirname, '../dist/client/index.html');
  console.log(`Loading template from: ${templatePath}`);
  
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Create output directory for prerendered pages
  const outputDir = path.resolve(__dirname, '../dist/client');

  for (const page of pagesToPrerender) {
    console.log(`\nPrerendering ${page.url}...`);
    
    // Create a new QueryClient for each page
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    // Render the page
    const { html, dehydratedState } = await render({
      url: page.url,
      queryClient,
    });

    // Insert the rendered HTML and dehydrated state into the template
    const renderedHtml = template
      .replace('<!--app-html-->', html)
      .replace(
        '</head>',
        `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)};</script></head>`
      );

    // Determine output file path
    const outputPath = page.url === '/' 
      ? path.join(outputDir, 'index.html')
      : path.join(outputDir, page.url.slice(1), 'index.html');

    // Create directory if needed
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the rendered HTML
    fs.writeFileSync(outputPath, renderedHtml);
    console.log(`  ✓ Generated ${outputPath}`);
  }

  console.log('\n✅ Prerendering complete!');
  console.log('\nNote: Pages are pre-rendered with initial shell. Data will be fetched on client-side.');
}

prerender().catch((err) => {
  console.error('❌ Prerendering failed:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});
