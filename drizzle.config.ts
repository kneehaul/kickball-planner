import { defineConfig } from 'drizzle-kit';

// Generates SQL migrations into cloudflare-workers/migrations from the drizzle
// schema. Run with `npm run db:generate`. Applying migrations to D1 is handled
// by wrangler (see the db:migrate:* scripts in package.json), not drizzle-kit.
export default defineConfig({
  dialect: 'sqlite',
  schema: './cloudflare-workers/db/schema.ts',
  out: './cloudflare-workers/migrations',
});
