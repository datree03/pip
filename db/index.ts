import { env } from 'cloudflare:workers';
export function getDb() { if (!env.DB) throw new Error('Time tracker storage unavailable'); return env.DB; }
