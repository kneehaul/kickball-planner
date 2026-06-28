-- Migration 0000: initial schema (Foundation).
-- Hand-authored to match cloudflare-workers/db/schema.ts. Future schema changes
-- can be generated with `npm run db:generate` (drizzle-kit).

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`pronouns` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `player_strengths` (
	`player_id` text NOT NULL,
	`strength` text NOT NULL,
	PRIMARY KEY(`player_id`, `strength`),
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kicking_order_entries` (
	`game_plan_id` text NOT NULL,
	`position` integer NOT NULL,
	`player_id` text NOT NULL,
	PRIMARY KEY(`game_plan_id`, `position`),
	FOREIGN KEY (`game_plan_id`) REFERENCES `game_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kicking_order_plan_player_unique` ON `kicking_order_entries` (`game_plan_id`, `player_id`);
--> statement-breakpoint
CREATE TABLE `inning_lineups` (
	`game_plan_id` text NOT NULL,
	`inning_number` integer NOT NULL,
	`field_position` text NOT NULL,
	`player_id` text NOT NULL,
	PRIMARY KEY(`game_plan_id`, `inning_number`, `field_position`),
	FOREIGN KEY (`game_plan_id`) REFERENCES `game_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
