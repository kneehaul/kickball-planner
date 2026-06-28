// Drizzle schema for the full backend data model.
// See docs/superpowers/specs/2026-05-09-backend-features-design.md.
//
// Timestamp convention: D1/SQLite has no native TIMESTAMP type, so every
// created_at / expires_at column is stored as INTEGER unix-milliseconds via
// drizzle's `integer({ mode: 'timestamp_ms' })`, matching Date.now() in Workers.

import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date());

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAt(),
});

export const sessions = sqliteTable('sessions', {
  // id is the random opaque token; also the cookie value (single-index lookup).
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: createdAt(),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: createdAt(),
});

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  pronouns: text('pronouns'), // nullable; free-form (e.g. "she/her", "they/them")
  createdAt: createdAt(),
});

export const playerStrengths = sqliteTable(
  'player_strengths',
  {
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    strength: text('strength').notNull(), // one of shared/constants.ts STRENGTHS
  },
  (t) => [primaryKey({ columns: [t.playerId, t.strength] })],
);

export const gamePlans = sqliteTable('game_plans', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g. "vs Red Sox 5/15"
  createdAt: createdAt(),
});

export const kickingOrderEntries = sqliteTable(
  'kicking_order_entries',
  {
    gamePlanId: text('game_plan_id')
      .notNull()
      .references(() => gamePlans.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(), // 1-based batting order slot
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.gamePlanId, t.position] }),
    // A player kicks at most once per plan.
    uniqueIndex('kicking_order_plan_player_unique').on(t.gamePlanId, t.playerId),
  ],
);

export const inningLineups = sqliteTable(
  'inning_lineups',
  {
    gamePlanId: text('game_plan_id')
      .notNull()
      .references(() => gamePlans.id, { onDelete: 'cascade' }),
    inningNumber: integer('inning_number').notNull(), // 1-based
    fieldPosition: text('field_position').notNull(), // one of FIELD_POSITIONS
    // An unassigned position is the absence of a row, never a NULL player.
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.gamePlanId, t.inningNumber, t.fieldPosition] }),
  ],
);
