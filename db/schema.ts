import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
export const tracker = sqliteTable('tracker', {
 id: integer('id').primaryKey(), status: text('status').notNull(), startedAt: integer('started_at').notNull(), revision: integer('revision').notNull().default(0), hourlyRate: integer('hourly_rate_cents').notNull().default(2500),
});
export const sessions = sqliteTable('sessions', {
 id: text('id').primaryKey(), status: text('status').notNull(), start: integer('start').notNull(), end: integer('end').notNull(),
});
