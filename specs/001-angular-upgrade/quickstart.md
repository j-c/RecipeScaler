# Quickstart: Upgrade Angular & All Dependencies

**Feature**: 001-angular-upgrade  
**Date**: 2026-02-27

## Prerequisites

- Node.js 20+ (LTS) or Node.js 22+
- npm 10+
- Git

## Setup

```bash
git clone <repo-url>
cd RecipeScaler-uplift2
git checkout 001-angular-upgrade
npm install
```

## Development

```bash
# Start dev server
ng serve
# App available at http://localhost:4200
```

## Build

```bash
# Production build
ng build
# Output in dist/recipe-scaler/
```

## Test

```bash
# Unit tests
ng test

# E2E tests (requires app to be buildable)
npx playwright install --with-deps chromium
npx playwright test
```

## Verify the upgrade worked

1. Run `ng serve`
2. Open http://localhost:4200 — should redirect to `/r/{base64}` with the default "Manhattans for two" recipe
3. Change the scaled value of the first ingredient — all other ingredients should update proportionally
4. Change the "serves" value — all ingredients should scale to match

## URL contract

Recipes are encoded in the URL path as base64 JSON:

```
http://localhost:4200/r/{btoa(JSON.stringify(recipe))}
```

To create a recipe URL, base64-encode a JSON object matching the `Recipe` interface (see `data-model.md`).
