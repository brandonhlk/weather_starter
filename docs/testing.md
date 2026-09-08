# Testing and validation

- `npm test` runs Vitest with `backend/src/**/*.test.ts` in a Node environment.
- Run a focused test file with `npx vitest run backend/src/weather.test.ts`.
- Run one named test with `npx vitest run backend/src/routes/locations.test.ts -t "deletes a saved location"`.
- Use the injected `WeatherClient` interface and a fake client for route tests.
- Weather client tests stub global `fetch`; do not depend on live data.gov.sg responses.
- `npm run build` is the available type/build validation. There is no repository lint script; ESLint and Prettier dependencies are not wired to package scripts.
