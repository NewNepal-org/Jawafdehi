import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '/tmp',
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
  },
});
