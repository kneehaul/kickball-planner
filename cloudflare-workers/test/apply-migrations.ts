import { applyD1Migrations, env } from 'cloudflare:test';

// Apply all D1 migrations to the test database once before each test file runs.
// Per-test storage isolation rolls back row writes but keeps this schema layer.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
