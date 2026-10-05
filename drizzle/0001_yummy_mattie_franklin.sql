PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tracker` (
	`id` integer PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`hourly_rate_cents` integer DEFAULT 5000 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tracker`("id", "status", "started_at", "revision", "hourly_rate_cents") SELECT "id", "status", "started_at", "revision", "hourly_rate_cents" FROM `tracker`;--> statement-breakpoint
DROP TABLE `tracker`;--> statement-breakpoint
ALTER TABLE `__new_tracker` RENAME TO `tracker`;--> statement-breakpoint
PRAGMA foreign_keys=ON;