# Quickstart: Modernize Dependencies

**Date**: 2026-02-27 | **Branch**: `001-modernize-dependencies`

This document defines the exact commands used to validate each stage
of the upgrade. Run these in sequence to confirm the app is in a
working state after every major-version hop.

---

## Prerequisites

```bash
# Ensure Node 22.x LTS is active
node --version     # expect: v22.x.x
npm --version      # expect: 10.x.x

# Confirm you are on the correct branch
git branch --show-current   # expect: 001-modernize-dependencies

# Confirm Angular CLI is available at target version
ng version
```

---

## Gate: Install

Run after every `package.json` change:

```bash
rm -rf node_modules
npm install
```

Expected: exits 0 with no `npm ERR!` lines.

---

## Gate: Build

Run after every Angular version hop and after every dependency change:

```bash
npm run build
# or after Angular 6+:
ng build
```

Expected: exits 0. Output in `dist/`. Zero errors.

---

## Gate: Serve (App Loads)

Run after install + build passes:

```bash
ng serve --open
```

Then manually (or via e2e smoke test) verify:
1. Browser opens to `http://localhost:4200/`
2. App redirects to `/r` and renders the default Manhattan recipe.
3. Browser DevTools console shows no errors.

---

## Gate: Recipe URL (Behavior Preservation)

Use this URL to verify the base64 contract is intact. This URL encodes
the default Manhattan recipe and MUST render identically at every hop:

```
http://localhost:4200/r/eyJuYW1lIjoiTWFuaGF0dGFucyBmb3IgdHdvIiwiZGVzY3JpcHRpb24iOiI8cD5TaGFrZSB3aXRoIGljZSBhbmQgc2VydmUgaW4gYSBjaGlsbGVkIGNvdXBlIGdsYXNzLjwvcD48cD5Gcm9tIExpcXVpZCBJbnRlbGxpZ2VuY2UgYnkgRGF2ZSBBcm5vbGQ8L3A+IiwiYmFzZUluZ3JlZGllbnQiOnsibmFtZSI6IlJpdHRlbmhvdXNlIFJ5ZSB3aGlza2V5IiwiZGVzY3JpcHRpb24iOiI1MCUgQUJWIiwibWVhc3VyZSI6MTIwLCJ1bml0T2ZNZWFzdXJlIjoibWwifSwiYWRkaXRpb25hbEluZ3JlZGllbnRzIjpbeyJuYW1lIjoiQ2FycGFubyBBbnRpY2EgRm9ybXVsYSB2ZXJtb3V0aCIsImRlc2NyaXB0aW9uIjoiMTYuNSUgQUJWIiwibWVhc3VyZSI6NTMsInVuaXRPZk1lYXN1cmUiOiJtbCJ9LHsibmFtZSI6IkFuZ29zdHVyYSBiaXR0ZXJzIiwibWVhc3VyZSI6NCwidW5pdE9mTWVhc3VyZSI6ImRhc2hlcyJ9LHsibmFtZSI6IkJyYW5kaWVkIGNoZXJyaWVzIG9yIG9yYW5nZSB0d2lzdHMiLCJtZWFzdXJlIjoyLCJ1bml0T2ZNZWFzdXJlIjoiIn1dLCJudW1iZXJPZlNlcnZlcyI6Mn0=
```

Expected output when loaded:
- Recipe title: **Manhattans for two**
- Base ingredient: Rittenhouse Rye whiskey, 120 ml
- Additional ingredients: Carpano Antica Formula vermouth (53 ml),
  Angostura bitters (4 dashes), Brandied cherries or orange twists (2)
- Serves: 2

---

## Gate: Unit Tests

Run after any source code change and after each Angular hop (once
test tooling is migrated):

```bash
# Before Vitest migration (Karma):
ng test --watch=false --browsers=ChromeHeadless

# After Vitest migration:
ng test
```

Expected: all tests pass, zero failures.

---

## Gate: E2E Smoke Test

Run after Playwright is installed and the smoke test exists:

```bash
npx playwright test
```

Expected: the two smoke scenarios pass:
1. App loads at `/r` and renders default recipe.
2. Recipe URL with base64 param loads and renders recipe name + ingredients.

---

## Full Validation Sequence (run after every Angular major-version hop)

```bash
rm -rf node_modules && npm install   # Gate: Install
ng build                              # Gate: Build
ng test                               # Gate: Unit Tests (skip if not yet migrated)
ng serve &                            # spin up dev server
# Open browser to recipe URL above    # Gate: Recipe URL
kill %1                               # stop dev server
npx playwright test                   # Gate: E2E (once Playwright installed)
```

---

## Commit Message Convention

Each Angular version hop commit:
```
chore: upgrade Angular N→M (ng update @angular/core @angular/cli)
```

Third-party changes:
```
chore: remove ng2-sharebuttons
chore: migrate styling to Angular Material theming
chore: replace Karma with Vitest
chore: replace Protractor with Playwright
```

After all hops complete:
```
chore: modernize dependencies to Angular 19 LTS
```
