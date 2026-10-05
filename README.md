# P.I.P

A small shared Away and Phone tracker, with cute anime animations, a daily calendar, time averages, and costs.

- **Working is the default when Sitting down is selected.** Idle and Working time never count toward totals or cost.
- **Away and Phone start a session.** Returning to Working closes it. Sessions persist on the shared server and synchronize every five seconds.
- **Both Away and Phone cost money** at the global hourly rate. Today/week/month cards show separate totals, averages, costs, and a combined cost.
- Pacific time (`America/Los_Angeles`), Monday-start weeks, and correct splits at local midnight and daylight-saving changes.
- The first password submission per browser is rejected, regardless of its value. Subsequent submissions are checked on the server.
- Status animations include walking to the desk and sitting down, getting up and leaving, picking up the phone, and returning to typing. Pause/resume and reduced-motion settings are supported.

## Hosting

The interface is published by GitHub Actions to **https://datree03.github.io/pip/**. GitHub Pages serves static files. The existing Cloudflare Worker hosted through Sites supplies the password check and shared D1 database at **https://sit-time-tracker.nqktri.chatgpt.site**; that URL also serves the full app.

No password or server secret is shipped to GitHub Pages. The Pages interface uses a signed session token in sessionStorage; the signed first-attempt token is a browser-local access-flow preference in localStorage. Shared tracker records are always server-backed. The server accepts cross-origin requests only from the configured Pages origin. Direct access to the full app uses signed HttpOnly, SameSite=Strict cookies.

## Development

Install with `npm run install:ci`. Configure local secret keys listed in `.env.example`, using `.dev.vars` for Worker preview. Password hashes use PBKDF2 SHA-256 with 100,000 iterations, a random salt, and 32 output bytes. Keep matching secrets in Sites runtime settings, never source control.

For the full app: generate schema changes with `npm run db:generate`, build with `npm run build`, apply pending Drizzle migrations to local D1 using the generated `dist/server/wrangler.json` and `.wrangler/state`, then run `npm run dev`.

For the Pages interface: run `npm run build:pages`, then `npm run preview:pages`. To test against a local server, set `PIP_API_ORIGIN` only for the local build and allow the preview origin in the local server's `ACCESS_ALLOWED_ORIGIN`. Production builds default to the deployed server.

Pushes to `main` run `.github/workflows/pages.yml`. Publishing the server uses the Sites workflow; production D1 migrations are applied separately from local test records.

## Artwork

Built-in ImageGen produced `public/animations/{sitting,away,phone,working}.png` and `public/transitions/{arrive,leave,pick-phone,resume-work}.png`. Each transparent sheet is one row of six frames, 2172×724 pixels. Exact prompts are in `docs/animation-prompts.txt` and `docs/transition-prompts.txt`. Sprite viewports preserve the artwork's aspect ratio. Transition assets load before playback; rapid status changes cancel outdated sequences.
