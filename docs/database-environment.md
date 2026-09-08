# Database and environment

- Change database structure through `backend/src/schema.ts`, then run `npm run db:generate` and `npm run db:migrate`.
- `forecast_periods` and `daily_forecast` are SQLite JSON columns.
- Use `npm run reset` only to remove the local SQLite database and its WAL files during local reset/debugging.
- Backend environment variables are loaded from `.env`: `WEATHER_API_KEY`, `PORTLESS_PORT`, `PORTLESS_HTTPS`, and optional `DATABASE_PATH`.
- Frontend local configuration belongs in `frontend/.env.local`; normal development uses same-origin API requests.
