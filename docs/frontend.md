# Frontend conventions

- Keep server communication in `frontend/src/api.ts` and shared UI state in `frontend/src/state/store.tsx`.
- Components should consume store context and typed frontend models rather than calling backend endpoints directly.
- Keep the frontend model in `frontend/src/types.ts` aligned with the backend `WeatherSnapshot` and location response shape.
