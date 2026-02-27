# Implementation Plan: Upgrade Angular & All Dependencies

**Branch**: `001-angular-upgrade` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-angular-upgrade/spec.md`

## Summary

Upgrade RecipeScaler from Angular 2 (2016-era) to Angular 21.2.0 (latest stable) by scaffolding a fresh Angular 21 CLI project and porting the ~350 LOC of application source into it. All deprecated dependencies are removed or replaced per spec clarifications: `bootstrap-material-design` → Angular Material, `ng2-sharebuttons` → removed, Protractor → Playwright, Karma → Vitest.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: Angular 21.2.0, Angular Material 21.2.0, RxJS 7.x, zone.js 0.15.x  
**Storage**: N/A (URL-encoded recipe data — no backend, no database)  
**Testing**: Vitest (unit, Angular 21 default), Playwright (e2e)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 major versions)  
**Project Type**: SPA (single-page application, static hosting)  
**Performance Goals**: Default recipe renders in < 3 seconds  
**Constraints**: Static files only, no backend, URL is sole data store, minimal runtime dependencies  
**Scale/Scope**: ~350 LOC TypeScript, 2 components, 5 models/viewmodels, ~15 source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Simplicity First | PASS | Fresh scaffold is the simplest path. Angular Material is the only new runtime dep; justified by replacing abandoned `bootstrap-material-design`. No unnecessary abstractions added. |
| II. URL as Data Store | PASS | URL contract preserved. `btoa`/`atob` encoding is browser-native, unaffected by Angular version. Route pattern `r/:base64recipe` unchanged. |
| III. Buildable & Working | PASS | Bootstrap phase applies — temporary build breaks tolerated during port. Steady-state resumes once `ng build` succeeds and default recipe renders. |
| IV. Pragmatic Modernisation | PASS | Large leap (v2 → v21) explicitly allowed. Fresh scaffold + port is the fastest path for a ~350 LOC codebase. |
| V. Proportional Testing | PASS | Unit tests on core logic (scaling, encoding). Playwright e2e for smoke testing. No over-testing. |

**Pre-Phase 0 gate: PASS** — no violations.

### Post-Phase 1 Re-check

| Principle | Status | Notes |
|---|---|---|
| I. Simplicity First | PASS | Data model unchanged. No new abstractions. Angular Material replaces Bootstrap 1:1 for the components used. |
| II. URL as Data Store | PASS | Route config identical. Encoding unchanged. |
| III. Buildable & Working | PASS | Bootstrap phase covers the scaffold-and-port commits. |
| IV. Pragmatic Modernisation | PASS | Single leap, no intermediate versions. |
| V. Proportional Testing | PASS | Existing unit tests ported. One e2e smoke test added. |

**Post-Phase 1 gate: PASS** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-angular-upgrade/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (unchanged — models are ported as-is)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root — after migration)

```text
src/
├── app/
│   ├── app.ts                            # Root component (standalone)
│   ├── app.html                          # Root template (<router-outlet>)
│   ├── app.css                           # Root styles
│   ├── app.config.ts                     # Application config (providers)
│   ├── app.routes.ts                     # Route definitions
│   ├── app.spec.ts                       # Root component unit tests (Vitest)
│   ├── models/
│   │   ├── irecipe-ingredient.ts         # Interface (unchanged)
│   │   ├── abstract-recipe-ingredient.ts # Base class (unchanged)
│   │   ├── measured-recipe-ingredient.ts # Measured ingredient (unchanged)
│   │   ├── scaled-recipe-ingredient.ts   # Scaled ingredient (unchanged)
│   │   └── recipe.ts                     # Recipe model (unchanged)
│   ├── viewmodels/
│   │   ├── recipe-view-model.ts          # Recipe VM (unchanged)
│   │   └── recipe-ingredient-view-model.ts # Ingredient VM (unchanged)
│   └── recipe/
│       ├── recipe.ts                     # Recipe component (standalone, Material)
│       ├── recipe.html                   # Recipe template (Material markup)
│       ├── recipe.css                    # Recipe styles
│       └── recipe.spec.ts               # Recipe unit tests (Vitest)
├── index.html
├── main.ts                               # bootstrapApplication() entry point
└── styles.css                            # Global styles + Material theme
e2e/
└── recipe.spec.ts                        # Playwright smoke test
angular.json                              # Angular 21 CLI config
playwright.config.ts                      # Playwright config
package.json                              # Updated dependencies
tsconfig.json                             # TypeScript 5.9 config
tsconfig.app.json
tsconfig.spec.json
```

**Structure Decision**: Standard Angular 21 CLI single-project layout. Files follow the 2025 naming convention (`recipe.ts` not `recipe.component.ts`) to align with Angular 21 defaults. The `models/` and `viewmodels/` directories are preserved as-is — they contain pure TypeScript with no Angular dependencies and need zero changes.

## Complexity Tracking

No constitution violations — this section is empty.

## Migration Approach

### Strategy: Fresh Scaffold + Port

1. **Scaffold** a new Angular 21 project with `ng new` (standalone, CSS, no SSR)
2. **Copy** the model/viewmodel files verbatim (no changes needed)
3. **Port** the 2 components (AppComponent, RecipeComponent) to standalone with Material UI
4. **Port** the route config to `app.routes.ts`
5. **Port and update** unit tests for Vitest/standalone TestBed
6. **Add** Playwright e2e smoke test
7. **Delete** old config files (`angular-cli.json`, `karma.conf.js`, `protractor.conf.js`, `tslint.json`, old `e2e/`)

### Key Code Changes

| File | Change |
|---|---|
| `app.module.ts` | **Delete** — replaced by `app.config.ts` + `app.routes.ts` |
| `main.ts` | Rewrite: `bootstrapApplication(App, appConfig)` |
| `app.component.ts` → `app.ts` | Add `imports: [RouterOutlet]`; standalone decorator |
| `recipe.component.ts` → `recipe.ts` | Add standalone imports (`CommonModule`, `FormsModule`, Material modules); remove `Location`/`LocationStrategy` providers; remove share-buttons |
| `recipe.component.html` → `recipe.html` | Replace Bootstrap classes with Material components; remove `<share-buttons>` |
| Unit tests | `async()` → native `async/await`; update TestBed for standalone |
| `models/*.ts` | No changes |
| `viewmodels/*.ts` | No changes |

### Dependency Mapping

| Old Dependency | Action | New Dependency |
|---|---|---|
| `@angular/*@2.3` (7 packages) | Upgrade | `@angular/*@21.2.0` |
| `@angular/http@2.3` | Remove | (not used) |
| `@angular/material@2.0.0-beta` | Upgrade | `@angular/material@21.2.0` + `@angular/cdk@21.2.0` |
| `@angular/router@3.3` | Upgrade | `@angular/router@21.2.0` |
| `bootstrap-material-design@0.5` | Remove | (replaced by Angular Material) |
| `core-js@2.4` | Remove | (not needed) |
| `ng2-sharebuttons@1.1` | Remove | (feature dropped) |
| `rxjs@5.0` | Upgrade | `rxjs@7.x` |
| `ts-helpers@1.1` | Remove | `tslib` (bundled by CLI) |
| `zone.js@0.7` | Upgrade | `zone.js@0.15.x` |
| `angular-cli@1.0.0-beta` (dev) | Upgrade | `@angular/cli@21.2.0` |
| `typescript@2.0` (dev) | Upgrade | `typescript@5.9.3` |
| `karma` + plugins (dev) | Remove | Vitest (CLI default) |
| `protractor@4.0` (dev) | Remove | `@playwright/test` |
| `codelyzer` / `tslint` (dev) | Remove | (not needed) |
