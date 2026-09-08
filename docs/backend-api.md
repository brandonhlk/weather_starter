# Backend and API conventions

- Backend files use native ESM and explicit `.js` extensions in relative imports. Preserve the strict NodeNext TypeScript settings in `backend/tsconfig.json`.
- Keep `WeatherSnapshot` synchronized across `backend/src/schema.ts`, the row conversion in `backend/src/db.ts`, and `frontend/src/types.ts`.
- Public weather JSON fields use snake_case. Drizzle properties use camelCase; `backend/src/db.ts` converts between them.
- Location coordinates are restricted to Singapore: latitude `1.1–1.5`, longitude `103.6–104.1`. The database also enforces unique latitude/longitude pairs.
- Preserve the API status behavior: 422 for invalid input, 409 for duplicate locations, 404 for missing locations, and 502 for refresh provider failures.
- Frontend telemetry uses `POST /api/logs`; event names must match the server pattern `^[a-z][a-z0-9_.:-]{1,63}$`. Keep `logInteraction` fire-and-forget.
