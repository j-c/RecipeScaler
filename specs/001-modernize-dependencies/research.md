# Research: Modernize Dependencies

**Phase 0 output** | Branch: `001-modernize-dependencies` | Date: 2026-02-27

All NEEDS CLARIFICATION items from the Technical Context are resolved below.

---

## Decision 1: Target Angular Version

**Decision**: Angular **19.x** (LTS)

**Rationale**: As of February 27, 2026, Angular **21.2** is the latest release.
Angular 19 is in active LTS support through May 2026. Both are valid targets.
Angular 19 is chosen because:

- The spec assumptions explicitly named 19.x at authoring time.
- Upgrading 2→19 (16 major versions) is already a large-scope body of work;
  the path from 19→21 is only 2 more hops and is trivially addressed in a
  follow-up spec once the project is stabilised on 19.
- Angular 19 LTS support ends May 2026, providing a clear forcing function
  for the 19→20→21 follow-up.

**Alternatives considered**:
- Angular 21 (latest): Would add 2 more hops. Valid choice but increases
  initial scope and introduces the esbuild-first build pipeline changes of
  v20–21. Better done as a fast follow-up once the codebase is stable.

**Target version matrix** (all to be confirmed via `ng update` at implementation
time; versions here are minimums/ranges as of Feb 2026):

| Package | From | To |
|---|---|---|
| Node.js | unknown (legacy) | 22.x LTS |
| Angular CLI | 1.0.0-beta.28.3 | 19.x |
| `@angular/*` | 2.3.1 | 19.x |
| TypeScript | 2.0.3 | 5.6.x |
| RxJS | 5.0.1 | 7.8.x |
| Zone.js | 0.7.2 | 0.15.x |
| `@angular/material` + CDK | 2.0.0-beta.1 | 19.x |

---

## Decision 2: Angular Major-Version Upgrade Path

**Decision**: Every major version must be visited individually with no skips
(except Angular 3, which never existed). `ng update` CLI must be used at each
hop.

**Required path**:
```
2 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19
```
That is 16 upgrade commits. Angular 3 was intentionally skipped by the Angular
team to align package versions; it is the only acceptable skip.

**Critical blockers per hop** (issues relevant to this codebase):

| Hop | Blocker | Action Required |
|---|---|---|
| 2→4 | `HttpClient` introduced | Begin planning migration away from `@angular/http` |
| 4→5 | `@angular/http` deprecated | Migrate to `HttpClient` in this hop |
| 5→6 | `angular-cli.json` → `angular.json`; RxJS 6 | `ng update` automates config; install `rxjs-compat@6` bridge |
| 6→7 | TypeScript 3.1+ required | Minor TS update |
| 7→8 | Lazy routes must use dynamic `import()` (string syntax removed in v9) | Not applicable — no lazy routes in this SPA |
| 8→9 | `@angular/http` **removed**; Ivy default; template type-checking tightened | Must complete `@angular/http` migration before this hop; fix template type errors |
| 9→10 | CommonJS warnings | Minor; no action needed |
| 10→11 | Font inlining | Minor; no action needed |
| 11→12 | Webpack 5; ViewEngine removed; IE 11 dropped; tslint/codelyzer removed from new projects | Remove tslint/codelyzer; no ViewEngine code to migrate |
| 12→13 | `build-angular:tslint` builder **removed** | Replace with `@angular-eslint` before or during this hop |
| 13→14 | TypeScript 4.6+; typed reactive forms | Fix any type errors surfaced by `FormControl<T>` |
| 14→15 | TypeScript 4.8+; Angular Material **MDC rebuild** (largest breaking change) | Migrate component templates — CSS classes, DOM structure changed; use `ng update` then review |
| 15→16 | TypeScript 5.0+; functional router guards default | Update router guards if any |
| 16→17 | esbuild + Vite application builder default for new projects; opt existing in | Switch to esbuild builder via `ng update` |
| 17→18 | `browserTarget` removed from dev-server builder; use `buildTarget` | `ng update` automates |
| 18→19 | Protractor builder **removed entirely** | Must have replaced Protractor before this hop |

**Rationale**: Angular's official versioning policy mandates one major at a time.
`ng update` schematics handle the majority of breaking changes automatically, but
each hop must be individually committed and verified (FR-019, Constitution II).

**Alternatives considered**:
- Big-bang upgrade (all at once): Rejected. Violates Constitution Principle II
  (Incremental Migration) and makes debugging impossible when things break.

---

## Decision 3: `@angular/http` Migration

**Decision**: Migrate from `@angular/http` (`Http`, `HttpModule`) to
`@angular/common/http` (`HttpClient`, `HttpClientModule`) at the **4→5 hop**.

**Rationale**: `@angular/http` is deprecated at Angular 5, removed at Angular 8.
Must be gone before the v8→v9 hop. The v4→v5 window provides the clearest
migration moment with the most tooling support.

**Note**: Inspection of this codebase shows it has no apparent HTTP calls
(it is a pure client-side SPA with no backend). `@angular/http` is listed as
a dependency but may be unused. Verify during implementation:
- If unused: simply remove the `@angular/http` import from `AppModule` and
  the package from `package.json`.
- If used: migrate each injection site from `Http` to `HttpClient` and update
  response handling (`.map(res => res.json())` is not needed with `HttpClient`).

---

## Decision 4: RxJS Migration Path

**Decision**: Two-hop migration: RxJS 5 → 6 (with `rxjs-compat` bridge) →
then drop compat and fix deprecations → RxJS 7.

**Hop 1: RxJS 5.0.1 → 6.x** (at the Angular 5→6 hop):
- Install `rxjs@6` + `rxjs-compat@6` together. The compat package shims all
  old import paths, keeping the app compilable immediately.
- Run `rxjs-5-to-6-migrate` (from `rxjs-tslint`) to auto-rewrite import paths
  and convert chained operators to `pipe()`. Review output manually.
- Key renames: `do` → `tap`, `catch` → `catchError`, `finally` → `finalize`.
- Remove `rxjs-compat` before the v9 hop.

**Hop 2: RxJS 6.x → 7.x** (after stabilising on Angular 9+, before v12):
- No compat shim exists for v7. Breaking changes are smaller than 5→6.
- Key changes: `resultSelector` parameters removed, `toPromise()` returns
  `T | undefined`, `throwError` factory form required.
- Target: `rxjs@7.8.x`.

**Rationale**: No skip path exists. 5→6 is the largest migration; 6→7 is minor.
The `rxjs-tslint` tool (though TSLint-based and unmaintained) is still functional
for the 5→6 automated rewrite and is worth running as a first pass.

---

## Decision 5: Unit Test Tooling

**Decision**: Migrate from Karma + Jasmine to **Vitest** with `jsdom`.

**Rationale**:
- Vitest is the Angular 19 default unit test runner (replaces Karma in Angular 17+).
- The `@angular/build:unit-test` builder uses Vitest by default in new projects.
- Angular provides an official (experimental) Jasmine → Vitest migration
  schematic: `ng g @schematics/angular:refactor-jasmine-vitest`.
- Karma is not removed but is no longer the default; using Vitest aligns the
  project with the Angular 19 standard and avoids future Karma deprecation work.

**Migration steps**:
1. Remove: `karma`, `karma-chrome-launcher`, `karma-jasmine`, `karma-remap-istanbul`,
   `karma-cli`, `jasmine-core`, `jasmine-spec-reporter`.
2. Remove: `karma.conf.js`, `src/test.ts`.
3. Install: `vitest`, `jsdom`.
4. Update `angular.json` test target: builder → `@angular/build:unit-test`.
5. Run `ng g @schematics/angular:refactor-jasmine-vitest` and review output.
6. Rewrite any tests using `fakeAsync`/`flush` — these are not supported under
   Vitest (zone.js patches do not apply in Vitest environment). Use native
   `async/await` with `vi.useFakeTimers()` instead.

**Alternatives considered**:
- Keep Karma: Supported but not the default; requires ongoing maintenance as
  Karma community support shrinks. Rejected in favour of the Angular-recommended path.
- Jest: Popular in the wider React ecosystem but does not have first-class
  Angular CLI integration. Not the Angular 19 default. Rejected.

---

## Decision 6: E2E Test Framework

**Decision**: Replace Protractor with **Playwright** via `playwright-ng-schematics`.

**Rationale**:
- Protractor is officially removed from Angular 19 (builder removed in v18→v19 hop).
- Angular provides no mandated replacement; Playwright and Cypress both have
  first-class `ng add` schematics.
- Playwright is chosen because:
  - Multi-browser by default (Chromium, Firefox, WebKit in one run).
  - TypeScript-first, no separate `@types` package needed.
  - Angular's own tooling uses Playwright as the browser provider for
    `@vitest/browser` — consistency with the unit test setup.
  - `playwright-ng-schematics` provides an `ng add` command and generates
    Angular-aware configuration.
- Minimum deliverable per FR-018: one smoke test that (a) loads the app,
  and (b) loads a recipe from a base64 URL and validates recipe name and
  at least one ingredient.

**Alternatives considered**:
- Cypress: Equally valid; listed first in Angular docs. More established for
  Angular but Chromium-only by default. Rejected in favour of Playwright's
  multi-browser baseline.

**Install command**:
```bash
ng add playwright-ng-schematics
```

---

## Decision 7: Angular Material Migration

**Decision**: follow `ng update @angular/material` at each Angular major hop;
apply manual remediation at two critical stops — v15 (MDC rebuild) and v19
(theming API).

**Two critical migration events**:

1. **v15 (MDC rebuild)** — largest breaking change in Angular Material's history:
   - All core components (`mat-button`, `mat-card`, `mat-input`, `mat-toolbar`)
     rebuilt on Material Design Components web library.
   - DOM structure and CSS class names changed.
   - Old implementations moved to `MatLegacy*` variants (one release cycle only;
     removed in v17).
   - `ng update` migrates module imports automatically; visual regression
     testing is required after this hop (NFR-001: loose visual parity).
   - At v15, the `bootstrap-material-design` package and Bootstrap 3 CDN must
     already be removed to avoid CSS conflicts.

2. **v19 (new theming API)**:
   - `mat.core()` is gone. `mat.define-light-theme()` family replaced by
     `mat.theme()` single mixin outputting CSS custom properties.
   - Entire `styles.scss` theme block must be rewritten. Template:
     ```scss
     @use '@angular/material' as mat;
     html {
       @include mat.theme((
         color: mat.$azure-palette,
         typography: Roboto,
         density: 0,
       ));
     }
     ```
   - `ng update` provides automated migration for M2-prefix renames (v18 step)
     and `mat.theme()` (v19 step).

**CDK**: `@angular/cdk` must always match `@angular/material` version exactly.
Both are updated together via `ng update @angular/material @angular/cdk`.

---

## Decision 8: Zone.js Migration

**Decision**: Upgrade `zone.js` from `0.7.2` to `0.15.x` (Angular 19 requirement).

**Key breaking change: import path** (changed in v0.14):
```ts
// OLD — breaks on zone.js 0.14+
import 'zone.js/dist/zone';          // in polyfills.ts
import 'zone.js/dist/zone-testing';  // in test.ts

// NEW
import 'zone.js';                    // in polyfills.ts
import 'zone.js/testing';            // in test setup
```

This change is in `src/polyfills.ts`. Must be applied at the hop where
`zone.js` is bumped past v0.14 (typically the v12/v13 hop).

**Zoneless**: Angular 19 offers zoneless as Developer Preview. Do not adopt
for this upgrade — it requires full OnPush/signals readiness. Track as a
future spec item (Angular 21 makes zoneless the default).

---

## Decision 9: TSLint → ESLint

**Decision**: Replace `tslint` + `codelyzer` with `@angular-eslint/schematics`.

**Timing**: Must be done at or before the **12→13 hop** (the build-angular
tslint builder is removed at v13).

**Migration**:
```bash
ng add @angular-eslint/schematics
ng g @angular-eslint/schematics:convert-tslint-to-eslint \
  --remove-tslint-if-no-more-tslint-targets
```

This generates `.eslintrc.json`, removes `tslint.json`, and installs
`@angular-eslint/eslint-plugin`, `@angular-eslint/eslint-plugin-template`,
`eslint`, and `@typescript-eslint/eslint-plugin`.

---

## Decision 10: Third-Party Package Dispositions

| Package | Current | Decision | Replacement / Notes |
|---|---|---|---|
| `ng2-sharebuttons` | `^1.1.5` | **Remove** | Deferred to follow-up spec (Q1 clarification). Remove `ShareButtonsModule` from `AppModule` and `<share-buttons>` from templates. |
| `bootstrap-material-design` | `^0.5.10` | **Remove** | Consolidate to Angular Material theming (Q2). Remove `@import` from `styles.css`. |
| Bootstrap 3 CDN | CDN link | **Remove** | Remove `<link>` from `index.html` (Q2). |
| Font Awesome 4 CDN | CDN link | **Remove** | Replace any remaining icons with Angular Material icons (Q3). Remove `<link>` from `index.html`. |
| `ts-helpers` | `^1.1.1` | **Remove** | Superseded by TypeScript's built-in `tslib`. Remove package; confirm `tslib` is in deps (Angular CLI adds it automatically). |
| `core-js` | `^2.4.1` | **Remove** | Polyfills are managed by Angular CLI's automatic differential loading / browserslist. Validate at v9+ that no explicit polyfills are needed. |
| `@types/node` | `^6.0.42` | **Update** | Update to current `@types/node` compatible with Node 22. Bundled via `ng update`. |
| `@types/jasmine` | `2.5.38` | **Remove** | Removed when migrating to Vitest (no longer needed). |
| `protractor` | `~4.0.13` | **Remove** | Remove config and `e2e/` directory; replace with Playwright. |
| `ts-node` | `1.2.1` | **Update** | Updated via `ng update` as part of CLI upgrade. |

---

## Resolved: All NEEDS CLARIFICATION Items

The Technical Context contained no NEEDS CLARIFICATION markers for this
upgrade spec (all were resolved using publicly documented Angular version
compatibility tables). The following informational unknowns are resolved:

| Unknown | Resolved Value |
|---|---|
| Target Angular version | Angular 19.x (LTS) |
| Required Node version | Node 22.x LTS (minimum: 18.19.1) |
| Required TypeScript version | 5.6.x |
| Required RxJS version | 7.8.x |
| Required Zone.js version | 0.15.x |
| Unit test framework | Vitest + jsdom |
| E2E test framework | Playwright (`playwright-ng-schematics`) |
| `@angular/http` removal version | Removed at Angular 8; migrate at v4→v5 hop |
| `angular-cli.json` migration version | Angular 6 (`ng update` automates) |
| TSLint removal version | Angular 13 (migrate at v12→v13 hop) |
| Angular Material critical stops | v15 (MDC rebuild), v19 (theming overhaul) |
| Zone.js import path change | 0.14+ (update `polyfills.ts` at v12/v13 hop) |
