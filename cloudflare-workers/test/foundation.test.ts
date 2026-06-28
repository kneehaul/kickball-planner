import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createDb } from '../db';
import {
  gamePlans,
  inningLineups,
  kickingOrderEntries,
  players,
  playerStrengths,
  sessions,
  teams,
  users,
} from '../db/schema';

// Foundation smoke test: the migration applies cleanly and drizzle can query
// every table. No auth or CRUD yet — that arrives in later issues.
describe('foundation: schema + migration', () => {
  it('exposes the D1 binding', () => {
    expect(env.DB).toBeDefined();
  });

  it('drizzle can query every table (all empty after migration)', async () => {
    const db = createDb(env.DB);
    expect(await db.select().from(users)).toEqual([]);
    expect(await db.select().from(sessions)).toEqual([]);
    expect(await db.select().from(teams)).toEqual([]);
    expect(await db.select().from(players)).toEqual([]);
    expect(await db.select().from(playerStrengths)).toEqual([]);
    expect(await db.select().from(gamePlans)).toEqual([]);
    expect(await db.select().from(kickingOrderEntries)).toEqual([]);
    expect(await db.select().from(inningLineups)).toEqual([]);
  });

  it('round-trips rows through the team → player → strength chain', async () => {
    const db = createDb(env.DB);

    await db
      .insert(users)
      .values({ id: 'u1', email: 'coach@example.com', passwordHash: 'x' });
    await db.insert(teams).values({ id: 't1', ownerId: 'u1', name: 'Sluggers' });
    await db
      .insert(players)
      .values({ id: 'p1', teamId: 't1', name: 'Pat' });
    await db
      .insert(playerStrengths)
      .values({ playerId: 'p1', strength: 'FAST' });

    const got = await db.select().from(players);
    expect(got).toHaveLength(1);
    expect(got[0]).toMatchObject({ id: 'p1', teamId: 't1', name: 'Pat' });
    expect(got[0].createdAt).toBeInstanceOf(Date);
  });
});
