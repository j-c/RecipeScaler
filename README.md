# Recipe Scaler

Simple recipe scaling tool. Recipes are encoded in the URL so links are fully shareable without a backend.

This project uses Angular 21 with standalone components, Angular Material, Vitest, and Playwright.

## Development server
Run `npm start` (or `ng serve`) and open `http://localhost:4200/`.

## Build
Run `npm run build` to create a production build in `dist/recipe-scaler-ng21/`.

## Unit tests
Run `npm test -- --watch=false` (or `ng test --watch=false`).

## End-to-end tests
Run `npx playwright install --with-deps chromium` once, then run `npx playwright test`.

## Quick verification
Use this command to validate build + unit + e2e in one pass:

`npm run build && npm test -- --watch=false && npx playwright test`

## Notes
- Default app route redirects to an encoded recipe URL.
- Styling intentionally uses Angular Material defaults; custom visual styling is deferred.

