import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173' },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }]
});
