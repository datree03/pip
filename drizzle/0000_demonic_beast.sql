CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracker` (
	`id` integer PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`hourly_rate_cents` integer DEFAULT 2500 NOT NULL
);
