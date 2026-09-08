# Architecture

- This is an npm-workspaces monorepo: `backend/` contains the Node/Express server and `frontend/` contains the React/Vite client.
- In development, `scripts/dev.mjs` starts `backend/src/server.ts` through Portless. Express owns `/api/*`, while Vite runs in middleware mode and serves the SPA from the same process and origin. The client uses relative `/api` URLs.
- In production, `npm run build` emits `frontend/dist` and `backend/dist`; `scripts/start.mjs` runs the compiled server, which serves the built SPA and API.
- The backend persists saved Singapore coordinates and the latest weather snapshot in SQLite (`backend/weather.db` by default). Drizzle schema definitions live in `backend/src/schema.ts`; generated migrations live in `backend/drizzle/`.
- `backend/src/weather.ts` integrates Singapore data.gov.sg APIs, combining area forecasts, station readings, air quality, UV, and longer forecasts into one `WeatherSnapshot`.
- `backend/src/routes/locations.ts` validates coordinates and handles location CRUD and weather refresh. Creation stores a placeholder, then attempts an immediate refresh; provider failure during creation returns the saved placeholder, while refresh failure returns an upstream error.
- `frontend/src/api.ts` is the typed HTTP boundary. `frontend/src/state/store.tsx` owns loading, selection, create/refresh/delete operations, and UI error state; components consume that context rather than calling the API directly.
