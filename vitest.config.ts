import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Config khusus unit test: TANPA plugin svelte/kit agar tidak crash di Vitest.
// Test Fase 4 hanya menyentuh lib murni (gps/format/config) — OSS, mockup.
export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $routes: path.resolve('./src/routes'),
      '$app/environment': path.resolve('./tests/stub/app-environment.ts')
    }
  },
  test: { include: ['tests/unit/**/*.test.ts'] }
});
