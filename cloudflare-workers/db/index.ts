// Drizzle client factory. Build a typed db from the request's D1 binding:
//
//   const db = createDb(c.env.DB);
//   await db.select().from(schema.teams)...
//
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Db = ReturnType<typeof createDb>;
export { schema };
