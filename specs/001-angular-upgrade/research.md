# Research: Upgrade Angular & All Dependencies

**Feature**: 001-angular-upgrade  
**Date**: 2026-02-27

## Migration Strategy

- **Decision**: Scaffold a fresh Angular 21 CLI project and port ~350 LOC into it
- **Rationale**: The codebase is tiny (15 files, ~350 LOC TypeScript). In-place upgrade through 19 major versions would require dozens of intermediate steps. A fresh scaffold + port is faster and simpler.
- **Alternatives considered**:
  - Step-by-step upgrade (Angular 2→4→5→...→21): Rejected — excessive effort for a micro-codebase
  - In-place jump (update package.json versions directly): Rejected — config format changed entirely (angular-cli.json → angular.json, webpack → vite+esbuild), too many build-system changes to reconcile

## Angular 21 CLI Defaults

| Setting | Angular 21 Default |
|---|---|
| Components | **Standalone** (no NgModules) |
| Build system | **Vite + esbuild** (`@angular/build:application`) |
| Test runner | **Vitest** (not Karma/Jasmine) |
| SSR | Not included by default |
| Style format | CSS |
| File naming | 2025 guide: `app.ts`, `app.html` (not `app.component.ts`) |
| TypeScript | ~5.9.x (requires >=5.9 <6.1) |
| No polyfills.ts | Gone; no `test.ts` either |

## Breaking Changes Affecting This Codebase

### `@angular/http` → dropped
- Removed in Angular 6. Replacement: `@angular/common/http` with `HttpClient`.
- **This app never actually uses HTTP calls** — `HttpModule` was imported but never injected. Simply drop it.

### `HttpModule` → not needed
- Can be removed entirely since no HTTP requests are made.

### Template syntax (`*ngIf`, `*ngFor`)
- Still fully supported in Angular 21. No changes needed.
- New `@if`/`@for` control flow exists but is optional; old syntax works.
- Standalone components need `CommonModule` (or individual `NgIf`/`NgFor`) in `imports`.

### `async()` in tests → `waitForAsync()`
- Renamed in Angular 12. The old name was removed.
- Alternatively, use native `async/await` (Angular 21 default pattern).

### `angular-cli.json` → `angular.json`
- Renamed in Angular CLI v6. Schema completely different.
- Fresh scaffold provides correct config; old file is irrelevant.

### Router API
- Route config pattern `{ path: 'r/:base64recipe', component: RecipeComponent }` is unchanged.
- `ActivatedRoute`, `route.params`, `Router` all still exist.
- Standalone uses `provideRouter(routes)` instead of `RouterModule.forRoot(routes)`.

### NgModule → Standalone
- `bootstrapApplication()` replaces `platformBrowserDynamic().bootstrapModule()`.
- No `AppModule`; each component declares its own `imports`.
- `provideRouter(routes)` in `app.config.ts` replaces `RouterModule.forRoot()`.

### Other
- `styleUrls` → `styleUrl` (singular) in scaffold. Both work.
- Signals are the default pattern but class properties still work.
- `ts-helpers` → `tslib` (already bundled by Angular CLI).
- `core-js` polyfills → not needed (modern browsers only).

## Angular Material 21

- **Decision**: Use `@angular/material@21.2.0` with `@angular/cdk@21.2.0`
- **Rationale**: Angular-native, actively maintained, aligns with Angular defaults
- **Import pattern**: Each Material module imported directly in standalone component `imports` array
- **Components needed**: `MatCardModule`, `MatTableModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`
- No NgModule layer needed

## Playwright for E2E

- **Decision**: Manual Playwright setup (not `ng add`)
- **Rationale**: Simple, first-class GitHub Actions support, no Angular-specific adapter needed
- **Config**: `playwright.config.ts` with `webServer` pointing to `ng serve` on port 4200
- **Test dir**: `e2e/` directory

## Vitest for Unit Tests

- **Decision**: Use Angular 21's default Vitest test runner (replaces Karma/Jasmine)
- **Rationale**: Aligns with Angular 21 defaults; faster than Karma; Jasmine-style syntax works in Vitest
- **Impact**: Existing test files need minor updates:
  - `async()` → `waitForAsync()` or native `async/await`
  - TestBed setup largely unchanged
  - Import paths stay the same

## Dependency Mapping (Old → New)

| Old Dependency | Action | New Dependency |
|---|---|---|
| `@angular/core@2.3` | Upgrade | `@angular/core@21.2.0` |
| `@angular/common@2.3` | Upgrade | `@angular/common@21.2.0` |
| `@angular/compiler@2.3` | Upgrade | `@angular/compiler@21.2.0` |
| `@angular/forms@2.3` | Upgrade | `@angular/forms@21.2.0` |
| `@angular/http@2.3` | Remove | (not used) |
| `@angular/material@2.0.0-beta` | Upgrade | `@angular/material@21.2.0` |
| `@angular/platform-browser@2.3` | Upgrade | `@angular/platform-browser@21.2.0` |
| `@angular/platform-browser-dynamic@2.3` | Upgrade | `@angular/platform-browser-dynamic@21.2.0` |
| `@angular/router@3.3` | Upgrade | `@angular/router@21.2.0` |
| `bootstrap-material-design@0.5` | Remove | `@angular/material@21.2.0` |
| `core-js@2.4` | Remove | (not needed) |
| `ng2-sharebuttons@1.1` | Remove | (feature dropped) |
| `rxjs@5.0` | Upgrade | `rxjs@7.x` (Angular 21 peer dep) |
| `ts-helpers@1.1` | Remove | `tslib` (bundled by CLI) |
| `zone.js@0.7` | Upgrade | `zone.js@0.15.x` |
| `angular-cli@1.0.0-beta` | Upgrade (dev) | `@angular/cli@21.2.0` |
| `typescript@2.0` | Upgrade (dev) | `typescript@5.9.3` |
| `karma` + plugins | Remove (dev) | Vitest (bundled by CLI) |
| `protractor@4.0` | Remove (dev) | `@playwright/test` |
| `codelyzer@2.0` | Remove (dev) | (Angular ESLint or not needed) |
| `jasmine-core` + `jasmine-spec-reporter` | Remove (dev) | Vitest |
| `karma-remap-istanbul` | Remove (dev) | Vitest coverage |
| `tslint@4.3` | Remove (dev) | (not needed; ESLint optional) |
| `ts-node@1.2` | Remove (dev) | (not needed) |

## Source File Migration Plan

| Source File | Changes Needed |
|---|---|
| `app.module.ts` | **Delete** — replaced by standalone `app.config.ts` + `app.routes.ts` |
| `app.component.ts` | Minor: add `imports: [RouterOutlet]` to decorator |
| `app.component.html` | No changes (just `<router-outlet>`) |
| `recipe.component.ts` | Add `imports: [CommonModule, FormsModule, MatCardModule, ...]` to decorator; remove `HttpModule` ref; update `Location`/`LocationStrategy` provider setup |
| `recipe.component.html` | Replace Bootstrap classes with Angular Material components; remove `<share-buttons>` |
| `recipe.component.spec.ts` | Replace `async()` with `waitForAsync()` or native async; update TestBed for standalone |
| `app.component.spec.ts` | Replace `async()` with native async; update TestBed for standalone |
| `models/*.ts` | No changes needed (pure TypeScript classes/interfaces) |
| `viewmodels/*.ts` | No changes needed (pure TypeScript classes) |
| `main.ts` | Rewrite to `bootstrapApplication()` |
| `index.html` | Update to Angular Material theme, remove Bootstrap CDN refs if any |
| `styles.css` | Add Angular Material theme import |
