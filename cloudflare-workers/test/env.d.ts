/// <reference types="@cloudflare/vitest-pool-workers/types" />
import type { D1Migration } from '@cloudflare/vitest-pool-workers';

// Type the bindings available to tests via `env` from "cloudflare:test".
declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      // Injected by vitest.config.ts so the setup file can apply migrations.
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}

export {};
