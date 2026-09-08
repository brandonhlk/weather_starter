# Copilot instructions

## Commands

Run commands from the repository root:

```bash
npm install
npm run dev             # Portless + Express/Vite development server
npm run build           # Frontend type-check/Vite build, then backend TypeScript build
npm run start           # Run the compiled production backend
npm test                # Run all backend Vitest tests once
npm run test:watch      # Run Vitest in watch mode
npm run doctor          # Check /health and /api/locations on the running app
npm run reset           # Remove the local SQLite database and WAL files
npm run db:generate     # Generate a Drizzle migration after schema changes
npm run db:migrate      # Apply Drizzle migrations
```

Run one test file or one test by name with Vitest:

```bash
npx vitest run backend/src/weather.test.ts
npx vitest run backend/src/routes/locations.test.ts -t "deletes a saved location"
```

There is no repository lint script. TypeScript compilation (`npm run build`) is the available static validation, and Prettier/ESLint dependencies are present but not wired to a package script.

## Architecture

- This is a TypeScript monorepo with npm workspaces: `backend/` contains the Node/Express server and `frontend/` contains the React/Vite client.
- In development, `scripts/dev.mjs` starts `backend/src/server.ts` through Portless. Express owns `/api/*`, while Vite runs in middleware mode and serves the SPA from the same process and origin. The client intentionally uses relative `/api` URLs.
- In production, `npm run build` emits `frontend/dist` and `backend/dist`; `scripts/start.mjs` runs the compiled server, which serves the built SPA and API.
- The backend persists saved Singapore coordinates and the latest weather snapshot in SQLite (`backend/weather.db` by default). Drizzle schema definitions live in `backend/src/schema.ts`; generated migrations live in `backend/drizzle/`.
- `backend/src/weather.ts` is the integration boundary for the Singapore data.gov.sg APIs. It combines the two-hour area forecast with station readings, air quality, UV, and longer forecasts into one `WeatherSnapshot`.
- `backend/src/routes/locations.ts` validates Singapore coordinates, creates/reads/deletes locations, and refreshes snapshots. Creating a location stores a placeholder first, then attempts an immediate weather refresh; provider failures during creation are logged and the saved placeholder is returned, while refresh failures return an upstream error.
- `frontend/src/api.ts` is the typed HTTP boundary. `frontend/src/state/store.tsx` owns loading, selection, create/refresh/delete operations, and UI error state; components consume that context rather than calling the API directly.

## Repository conventions

- Backend files use native ESM and explicit `.js` extensions in relative imports, even though the source is TypeScript. Preserve the NodeNext/strict TypeScript settings in `backend/tsconfig.json`.
- Keep the `WeatherSnapshot` shape synchronized across `backend/src/schema.ts`, the database row conversion in `backend/src/db.ts`, and `frontend/src/types.ts`. Weather fields are stored as the latest snapshot; `forecast_periods` and `daily_forecast` are SQLite JSON columns.
- Change database structure through `backend/src/schema.ts`, then generate and apply a Drizzle migration. Do not hand-edit the database or rely on deleting it except for local reset/debugging.
- Use the existing `WeatherClient` interface and inject a fake client into `createApp` for route tests. Weather client tests stub global `fetch`; do not make tests depend on live data.gov.sg responses.
- Location coordinates are deliberately limited to Singapore (`latitude 1.1–1.5`, `longitude 103.6–104.1`), and the schema also enforces unique latitude/longitude pairs. Preserve the API's 422/409/404/502 behavior when changing validation or routes.
- Keep frontend/backend contracts in snake_case for weather payload fields because that is the public JSON shape, while Drizzle column properties use camelCase and `db.ts` performs the conversion.
- Frontend interaction telemetry is sent through `POST /api/logs`; event names must match the server's lowercase `a-z0-9_.:-` pattern. Preserve the existing `logInteraction` fire-and-forget behavior for analytics failures.
- Environment configuration is loaded by the backend from `.env`: `WEATHER_API_KEY`, `PORTLESS_PORT`, `PORTLESS_HTTPS`, and optional `DATABASE_PATH`. Frontend local configuration belongs in `frontend/.env.local`, though normal development uses same-origin API requests.
