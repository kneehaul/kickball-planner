import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

// Runs tests inside a real Workers runtime against a real (in-memory) D1.
// Migrations are read from disk and applied per test file via the setup file.
//
// We configure miniflare directly (via the cloudflareTest plugin) rather than
// inheriting wrangler.jsonc: that file's `assets` block (for the SPA frontend)
// gets its `directory` injected by @cloudflare/vite-plugin at build time, which
// wrangler's standalone config parser rejects. Tests only need the Worker + its
// D1 binding, so we declare the relevant bits here and keep compat settings in
// sync with wrangler.jsonc.
export default defineConfig(async () => {
  const migrations = await readD1Migrations(
    path.join(__dirname, 'cloudflare-workers/migrations'),
  );

  return {
    plugins: [
      cloudflareTest({
        singleWorker: true,
        main: './cloudflare-workers/index.ts',
        miniflare: {
          compatibilityDate: '2026-04-20',
          compatibilityFlags: ['nodejs_compat'],
          d1Databases: ['DB'],
          // Surfaced to the setup file as env.TEST_MIGRATIONS.
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      setupFiles: ['./cloudflare-workers/test/apply-migrations.ts'],
    },
  };
});
