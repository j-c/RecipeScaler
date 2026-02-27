# Recipe Scaler

Simple recipe scaling tool. Enter a recipe once, then scale the ingredients to any number of serves.

Built with **Angular 19** (LTS) and **Angular Material**.

## Prerequisites

- **Node.js** ≥ 18.19 (see `.nvmrc` for the pinned version)
- **npm** ≥ 10

```bash
# If using nvm
nvm use
```

## Getting started

```bash
npm install --legacy-peer-deps
npm start                       # ng serve → http://localhost:4200
```

## Build

```bash
npm run build                   # production build → dist/
```

## Running unit tests

```bash
npm test                        # vitest run
```

## Running end-to-end tests

```bash
npm run e2e                     # playwright test (starts dev server automatically)
```

## Linting

```bash
npm run lint                    # ng lint (ESLint + angular-eslint)
```

## URL scheme

Recipes are encoded as base64 JSON in the URL:

```
http://localhost:4200/r/<base64-encoded-recipe-json>
```

Example — Manhattans:

```
http://localhost:4200/r/eyJuYW1lIjoiTWFuaGF0dGFucyIsIm1ha2VzIjoiMiIsImluZ3JlZGllbnRzIjpbeyJuYW1lIjoiQm91cmJvbiIsIm1lYXN1cmUiOiI0IG96IiwiZGVzY3JpcHRpb24iOiJCdWxsZWl0In0seyJuYW1lIjoiU3dlZXQgVmVybW91dGgiLCJtZWFzdXJlIjoiMiBveiIsImRlc2NyaXB0aW9uIjoiIn0seyJuYW1lIjoiQW5nb3N0dXJhIEJpdHRlcnMiLCJtZWFzdXJlIjoiNCBkYXNoZXMiLCJkZXNjcmlwdGlvbiI6IiJ9LHsibmFtZSI6IkNoZXJyeSIsIm1lYXN1cmUiOiIyIiwiZGVzY3JpcHRpb24iOiJNYXJhc2NoaW5vIn1dfQ==
```

## Further help

See the [Angular CLI docs](https://angular.dev/tools/cli) for more commands.
