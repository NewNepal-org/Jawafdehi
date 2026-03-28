// Feature: ssr-seo, Property 3: Helmet context is populated for routes with a Helmet component
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '../../src/entry-server';

/**
 * Validates: Requirements 3.1, 3.2
 */
describe('Property 3: Helmet context is populated for routes with a Helmet component', () => {
  it('helmetContext.helmet is defined and title is non-empty for routes with Helmet', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/about', '/cases', '/entities', '/information', '/updates', '/feedback'),
        async (url) => {
          const result = await render(url);
          expect(result.helmetContext.helmet).toBeDefined();
          expect(result.helmetContext.helmet!.title.toString()).not.toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });
});
