# Sit Time

A simple shared tracker for Sitting down, Away, Phone, and Working. All visitors update one shared tracker; timestamps and sessions persist in D1. Updates synchronize every five seconds.

## Time calculations

- Pacific time (`America/Los_Angeles`); weeks start Monday.
- Away and phone durations run until the next status change.
- Daily totals split sessions at local midnight, including daylight-saving changes.
- Totals include the current session. Away averages use completed sessions ending in the selected period.
- The global hourly rate applies to all recorded away time; default $25/hour.
- Status changes use an atomic transaction and revision check so simultaneous updates cannot duplicate a session.

## Development

Run `npm run install:ci`, then `npm run db:generate` after schema changes. Build with `npm run build`. Apply pending migrations locally using Wrangler and the generated `dist/server/wrangler.json`, with `--persist-to .wrangler/state`. Run `npm run dev` for the local preview.

The Sites publishing workflow provisions shared storage and applies the committed migrations. Local test records are never included in deployment.

## Validation

TypeScript and production build verified. Checked status transitions, stale-update rejection, global rate persistence, invalid inputs, midnight splitting, completed-session averages, active phone totals, and both daylight-saving boundaries. Optional WebMCP registration is feature-detected; no supported agent browser context was available for execution validation.

## Character animations

Four transparent six-frame sprite strips in `public/animations/` animate the chair swivel, walk cycle, phone thinking pose, and typing. Each sheet is 2172×724; a frame is 362×724. The viewport preserves the artwork's aspect ratio. Animations continue smoothly through timer updates and restart on status changes. Pause/resume is local to the browser and never changes the shared tracker. Reduced-motion settings show a still frame. Built-in ImageGen created the frames; exact prompts are in `docs/animation-prompts.txt`.
