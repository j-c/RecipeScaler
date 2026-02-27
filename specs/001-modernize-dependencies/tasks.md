# Tasks: Modernize Dependencies

**Input**: Design documents from `specs/001-modernize-dependencies/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/url-scheme.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel with other [P] tasks in the same group (different files, no shared state)
- **[US1]**: Buildable on Current Toolchain (P1)
- **[US2]**: Existing Recipes Still Work (P1)
- **[US3]**: Tests Pass on Modern Test Runner (P2)
- **[US4]**: Third-Party Libraries Resolved (P3)

> **Note**: Angular version hops are sequential by definition. Each hop must build and pass gates before the next begins. Parallelism markers appear within a single hop where tasks touch separate files simultaneously.

### Phase Mapping (tasks.md → plan.md)

| Tasks phase | Corresponds to plan.md phase | Summary |
|---|---|---|
| Phase 1 — Setup | Phase 0: Baseline Stabilisation | Record toolchain state |
| Phase 2 — Foundational | Phase 1: Node Runtime + Initial Dependency Audit | Node compatibility floor |
| Phase 3 — Angular 2→18 (all sub-phases) | Phase 2: Angular 2→6; Phase 3: 6→9; Phase 4: 9→13; Phase 5: 13→15; Phase 6: 15→19 (partial) | All Angular version hops |
| Phase 4 — Test Tooling + Final Hop | Phase 7: Test Tooling Migration + Phase 6 final sub-phase (18→19) | Playwright, Vitest, 18→19 |
| Phase 5 — Third-Party Audit | Phase 8: Final Validation & Housekeeping (dependency audit portion) | Dependency audit |
| Phase 6 — Polish | Phase 8: Final Validation & Housekeeping (docs/validation portion) | README, full gate run |

---

## Phase 1: Setup — Baseline Stabilisation

**Purpose**: Record the current toolchain state before touching any dependency. Establishes the commit baseline that all subsequent hops revert to if needed (Constitution Principle III: Reproducible Baseline).

**Gate**: No build gate required — this phase records facts, not builds.

- [X] T001 Add `.nvmrc` containing `22` to the repository root
- [X] T002 Add `engines` field (`"node": ">=22.0.0"`) to `package.json`
- [X] T003 Commit: `chore: record baseline toolchain (Node version, .nvmrc)`

---

## Phase 2: Foundational — Node Compatibility Floor

**Purpose**: Determine the minimum era-appropriate Node version at which Angular 2.3.1 compiles. This records the known-good starting point per Constitution Principle III and gates Phase 3 entry.

**⚠️ CRITICAL**: The app almost certainly does NOT build on Node 22 yet. That is expected. The goal here is documentation, not a passing build.

**Gate**: A written record in `specs/001-modernize-dependencies/research.md` documenting which Node version was used and what the build output was.

- [X] T004 Switch to an era-appropriate Node version (try Node 8, 10, or 12) via `nvm`; document the version in `specs/001-modernize-dependencies/research.md`
- [X] T005 Run `npm install` and `ng build`; record all errors in `specs/001-modernize-dependencies/research.md` under "Upgrade Notes"
- [X] T006 Commit: `chore: baseline — document Node compatibility floor`

---

## Phase 3: US1 + US2 — Angular 2 → 18 (Priority: P1) 🎯 MVP

**Goal**: Upgrade from Angular 2.3.1 to Angular 18.x across 16 sequential major-version hops, each a discrete, revertible commit that independently passes install + build + start (FR-019). URL contract preserved at every hop (FR-009).

**Independent Test**: Clone the repo, run `npm ci && ng build && ng serve`, navigate to a base64-encoded recipe URL — all must succeed with zero errors.

> **Timing Note**: The final hop (18 → 19) is deferred to Phase 4 because the Protractor builder is removed at v19. Protractor must be removed (T039) before that hop can proceed.

---

### Sub-phase 2a: Angular 2 → 4

- [X] T007 [US1] Run `ng update @angular/cli@4 @angular/core@4`; fix any template type errors surfaced by stricter checking
- [X] T008 [US2] Verify recipe decode/encode round-trip is unchanged (run the recipe URL gate from `quickstart.md`) — requires T007 build to complete first
- [X] T009 [US1] Commit: `chore: upgrade Angular 2→4`

---

### Sub-phase 2b: Angular 4 → 5

- [X] T010 [US1] Run `ng update @angular/cli@5 @angular/core@5`
- [X] T011 [US1] Migrate `HttpModule` + `Http` → `HttpClientModule` + `HttpClient` in `src/app/app.module.ts` (verify `@angular/http` usages; may be unused — confirm before removing)
- [X] T012 [US1] Commit: `chore: upgrade Angular 4→5; migrate @angular/http → HttpClient`

---

### Sub-phase 2c: Angular 5 → 6 (Config Migration + RxJS 6)

- [X] T013 [US1] Run `ng update @angular/cli@6 @angular/core@6` — `ng update` **automatically** converts `angular-cli.json` → `angular.json`
- [X] T014 [US1] Install `rxjs@6 rxjs-compat@6` in `package.json`
- [X] T015 [US1] Run `rxjs-5-to-6-migrate -p src/tsconfig.json` (rewrite import paths in `src/`); review all changes
- [X] T016 [US1] Uninstall `ts-helpers` from `package.json` (superseded by `tslib`)
- [X] T017 [US1] Commit: `chore: upgrade Angular 5→6; angular-cli.json→angular.json; rxjs 5→6 with compat`

**Gate**: `npm install && ng build && ng serve` must pass.

---

### Sub-phase 3a: Angular 6 → 7

- [ ] T018 [US1] Run `ng update @angular/cli@7 @angular/core@7` (TypeScript 3.1+ required)
- [ ] T019 [US1] Commit: `chore: upgrade Angular 6→7`

---

### Sub-phase 3b: Angular 7 → 8

- [ ] T020 [US1] Run `ng update @angular/cli@8 @angular/core@8`
- [ ] T021 [US1] Commit: `chore: upgrade Angular 7→8`

---

### Sub-phase 3c: Angular 8 → 9 (Ivy + @angular/http removed)

- [ ] T022 [US1] Verify `src/app/app.module.ts` has zero remaining `@angular/http` usages (BLOCKER: removed at v9)
- [ ] T023 [US1] Run `ng update @angular/cli@9 @angular/core@9` (Ivy is now default; fix all Ivy template type errors)
- [ ] T024 [US1] Update `src/polyfills.ts`: change `import 'zone.js/dist/zone'` → `import 'zone.js'` (import path changed at zone.js 0.14)
- [ ] T025 [US1] Uninstall `rxjs-compat` from `package.json` (all imports rewritten by T015); audit `package.json` and `src/polyfills.ts` for any explicit `core-js` usages and remove them — Angular 9+ CLI manages polyfills via browserslist automatically (per research.md Decision 10)
- [ ] T026 [US1] Commit: `chore: upgrade Angular 8→9; remove @angular/http; drop rxjs-compat; remove core-js; Ivy default`

**Gate**: install + build + serve must pass. Node 12+ is now sufficient.

---

### Sub-phase 4a: Angular 9 → 10

- [ ] T027 [US1] Run `ng update @angular/cli@10 @angular/core@10`
- [ ] T028 [US1] Commit: `chore: upgrade Angular 9→10`

---

### Sub-phase 4b: Angular 10 → 11

- [ ] T029 [US1] Run `ng update @angular/cli@11 @angular/core@11`
- [ ] T030 [US1] Commit: `chore: upgrade Angular 10→11`

---

### Sub-phase 4c: Angular 11 → 12 (Webpack 5)

- [ ] T031 [US1] Run `ng update @angular/cli@12 @angular/core@12`
- [ ] T032 [US1] Commit: `chore: upgrade Angular 11→12`

---

### Sub-phase 4d: TSLint → ESLint (MUST complete before Angular 13)

- [ ] T033 [US1] Run `ng add @angular-eslint/schematics` to scaffold ESLint config
- [ ] T034 [US1] Run `ng g @angular-eslint/schematics:convert-tslint-to-eslint --remove-tslint-if-no-more-tslint-targets`; review generated `.eslintrc.json`; fix immediate lint errors
- [ ] T035 [US1] Delete `tslint.json` from repository root
- [ ] T036 [US1] Commit: `chore: replace tslint/codelyzer with @angular-eslint`

---

### Sub-phase 4e: Angular 12 → 13 (tslint builder removed)

- [ ] T037 [US1] Run `ng update @angular/cli@13 @angular/core@13` (`tslint` builder is gone; T033–T036 already handled this)
- [ ] T038 [US1] Commit: `chore: upgrade Angular 12→13`

**Gate**: install + build + serve + `ng test` (Karma still present at this point).

---

### Sub-phase 5a: Angular 13 → 14 (Typed Reactive Forms)

- [ ] T039 [US1] Run `ng update @angular/cli@14 @angular/core@14 @angular/material@14 @angular/cdk@14` (TypeScript 4.6+ required)
- [ ] T040 [US1] Fix any `FormControl<T>` strict typing errors introduced by typed reactive forms
- [ ] T041 [US1] Commit: `chore: upgrade Angular 13→14`

---

### Sub-phase 5b: Angular 14 → 15 (MDC Rebuild + Third-Party Removal)

This is the most visually disruptive hop. Angular Material v15 rebuilds all components on MDC — DOM structure and CSS classes change. NFR-001 (loose visual parity) applies; do not attempt pixel-perfect restoration.

- [ ] T042 [US1] Run `ng update @angular/cli@15 @angular/core@15 @angular/material@15 @angular/cdk@15` (runs MDC migration schematics automatically)
- [ ] T043 [P] [US1] Uninstall `bootstrap-material-design` and `ng2-sharebuttons` from `package.json`
- [ ] T044 [P] [US1] Remove Bootstrap 3 CDN `<link>` and Font Awesome 4 CDN `<link>` from `src/index.html`
- [ ] T045 [P] [US1] Remove all `@import '~bootstrap-material-design/...'` lines from `src/styles.css`; apply Angular Material M2 SCSS theme (see plan.md Phase 5b for SCSS snippet)
- [ ] T046 [P] [US1] Remove `ShareButtonsModule` import and declaration from `src/app/app.module.ts`
- [ ] T047 [P] [US1] Remove `<share-buttons>` element from `src/app/recipe/recipe.component.html`; replace any remaining Font Awesome icon usages with `<mat-icon>` equivalents
- [ ] T048 [US2] Verify recipe URL loads, displays correctly, and scaling works after MDC migration; confirm layout intent preserved per NFR-001
- [ ] T049 [US1] Commit: `chore: upgrade Angular 14→15; MDC material; remove Bootstrap/FontAwesome/sharebuttons`

**Gate**: install + build + serve + recipe URL visual check.

---

### Sub-phase 6a: Angular 15 → 16

- [ ] T050 [US1] Run `ng update @angular/cli@16 @angular/core@16 @angular/material@16 @angular/cdk@16` (TypeScript 5.0+ required)
- [ ] T051 [US1] Commit: `chore: upgrade Angular 15→16`

---

### Sub-phase 6b: Angular 16 → 17 (esbuild Application Builder)

- [ ] T052 [US1] Run `ng update @angular/cli@17 @angular/core@17 @angular/material@17 @angular/cdk@17`
- [ ] T053 [US1] Migrate `angular.json` build target: accept `ng update` offer to switch from `@angular-devkit/build-angular:browser` → `@angular/build:application`
- [ ] T054 [US1] Commit: `chore: upgrade Angular 16→17; switch to esbuild application builder`

---

### Sub-phase 6c: Angular 17 → 18

- [ ] T055 [US1] Run `ng update @angular/cli@18 @angular/core@18 @angular/material@18 @angular/cdk@18` (auto-migrates `browserTarget` → `buildTarget` and M2 function names to `m2-` prefix in theming)
- [ ] T056 [US1] Commit: `chore: upgrade Angular 17→18`

**Checkpoint**: Angular is now at v18. The 18→19 hop is deferred — Protractor must be removed first (see Phase 4, T059–T061). Continue to Phase 4 before returning to T069.

---

## Phase 4: US3 — Tests Pass on Modern Test Runner + Final Hop (Priority: P2)

**Goal**: Migrate from Protractor (defunct) to Playwright and from Karma/Jasmine to Vitest. The Protractor removal unblocks the Angular 18→19 final hop. Delivers a passing test suite with a recipe URL smoke test (FR-018, SC-004, SC-008).

**Independent Test**: Run `npx playwright test` — smoke tests pass. Run `ng test` — all unit tests pass with zero failures.

> **Ordering constraint**: T059 (remove Protractor) must complete before T069 (Angular 18→19 hop). The final hop is at the end of this phase.

---

### Sub-phase 7a: Replace Protractor with Playwright

- [ ] T057 [US3] Uninstall `protractor` from `package.json`; remove the `e2e` target from `angular.json`
- [ ] T058 [US3] Delete `e2e/` directory and `protractor.conf.js` from repository root
- [ ] T059 [US3] Run `ng add playwright-ng-schematics` to scaffold `playwright/` directory with Angular-aware configuration
- [ ] T060 [US3] Write `playwright/smoke.spec.ts`: test (a) app loads at root URL with no console errors; test (b) base64-encoded recipe URL loads and renders the expected recipe name and at least one ingredient (see `contracts/url-scheme.md` for the default recipe URL)
- [ ] T061 [US3] Run Playwright smoke tests; confirm both pass
- [ ] T062 [US3] Commit: `chore: replace Protractor with Playwright; add recipe URL smoke test`

---

### Sub-phase 7b: Replace Karma/Jasmine with Vitest

- [ ] T063 [US3] Uninstall `karma`, `karma-chrome-launcher`, `karma-jasmine`, `karma-jasmine-html-reporter`, `karma-remap-istanbul`, `karma-cli`, `jasmine-core`, `jasmine-spec-reporter`, `@types/jasmine` from `package.json`
- [ ] T064 [US3] Install `vitest` and `jsdom` as dev dependencies
- [ ] T065 [US3] Update `angular.json` test builder to `@angular/build:unit-test` (replacing the Karma builder)
- [ ] T066 [US3] Run `ng g @schematics/angular:refactor-jasmine-vitest`; review all modified spec files
- [ ] T067 [US3] Rewrite any `fakeAsync`/`flush` usages in spec files using `async/await` + `vi.useFakeTimers()` as needed
- [ ] T068 [US3] Delete `karma.conf.js` and `src/test.ts`; verify `src/app/recipe/recipe.component.spec.ts` includes at minimum one test exercising recipe scaling arithmetic (quantity calculation)
- [ ] T069 [US3] Run `ng test`; confirm all tests pass with zero failures
- [ ] T070 [US3] Commit: `chore: replace Karma/Jasmine with Vitest`

---

### Sub-phase 6d: Angular 18 → 19 (Final Hop — requires T057 done)

> **Prerequisite**: T057 (Protractor removed from `angular.json`) must be complete before this task. The `build-angular:protractor` builder is removed at v19.

- [ ] T071 [US1] Run `ng update @angular/cli@19 @angular/core@19 @angular/material@19 @angular/cdk@19` (auto-migrates Angular Material theming to new `mat.theme()` API; removes `mat.core()`)
- [ ] T072 [US2] Run the full quickstart.md gate sequence: `npm ci && ng build && ng serve` + navigate to base64 recipe URL and verify recipe name, ingredients, and scaling are correct
- [ ] T073 [US1] Commit: `chore: upgrade Angular 18→19; mat.theme() theming API`

**Checkpoint**: Angular is now at v19 LTS. US1 and US2 are complete. Playwright smoke tests pass. Vitest unit tests pass.

---

## Phase 5: US4 — Third-Party Libraries Resolved (Priority: P3)

**Goal**: Confirm no abandoned or unmaintained dependencies remain in `package.json`. Most third-party removals were done during Phase 3 (sub-phase 5b). This phase handles final audit and the required follow-up spec stub.

**Independent Test**: Run `npm audit`; run `ng update`; inspect all packages — zero unmaintained or deprecated packages.

- [ ] T074 [US4] Run `npm audit`; resolve all high and critical severity vulnerabilities; record findings
- [ ] T075 [US4] Run `ng update`; confirm no further Angular package updates are available
- [ ] T076 [US4] Audit every entry in `package.json` dependencies and devDependencies: flag any package with no release in over 2 years; resolve or justify each
- [ ] T077 [P] [US4] Create follow-up spec stub at `specs/003-social-sharing/spec.md` with a placeholder noting that `ng2-sharebuttons` was removed and social sharing is deferred (per FR-014)
- [ ] T078 [US4] Commit: `chore: dependency audit complete; no unmaintained packages`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation from a clean state, documentation, and the closing commit that satisfies SC-001–SC-008.

- [ ] T079 Run `npm ci` (clean install) followed by full quickstart.md gate sequence: build, serve, recipe URL gate, `ng test`, `npx playwright test`
- [ ] T080 [P] Update `README.md`: document current Node 22 requirement, `npm ci`, `ng build`, `ng serve`, `ng test`, `npx playwright test` commands, and the base64 recipe URL scheme
- [ ] T081 [P] Confirm `.nvmrc` contains `22` and `package.json` `engines` field is set to `>=22.0.0`
- [ ] T082 Record upgrade notes in `specs/001-modernize-dependencies/research.md`: final version matrix, list of all manual steps taken, any known issues discovered
- [ ] T083 Final commit: `chore: modernize dependencies — Angular 19 LTS; update README`

---

## Dependencies (Story Completion Order)

```
Phase 1 (Setup)
  └── Phase 2 (Foundational / Node floor)
        └── Phase 3 (US1+US2 / Angular 2→18)  ←── sequential; each hop blocks the next
              ├── Phase 4 US3 sub-phase 7a (Remove Protractor) ← must complete before T071
              ├── Phase 4 US3 sub-phase 7b (Karma→Vitest)      ← can start after T038 (v13+)
              └── Phase 4 T071 (Angular 18→19)                 ← requires T057 done
                    └── Phase 5 (US4 / dependency audit)
                          └── Phase 6 (Polish & validation)
```

**Parallel opportunities per user story**:

- **US1+US2 (Phase 3)**: Within sub-phase 5b (Angular 14→15), T043–T047 touch five separate files and can be done in parallel (separate terminal tabs or file edits simultaneously).
- **US3 (Phase 4)**: After T062 (Protractor removed and Playwright done), sub-phase 7b (Vitest migration, T063–T070) is independent of the Angular 18→19 hop and can proceed in parallel with any Angular 19 research. However, T071 must wait for T057 specifically.
- **US4 (Phase 5)**: T074, T075, T076 can be run in any order; T077 (spec stub creation) is fully independent.
- **Phase 6**: T080 and T081 touch separate files and can be done in parallel.

---

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 through **sub-phase 2c** (Angular 5→6 with CLI config migration and RxJS 6). This delivers a project that builds on modern Node with a supported CLI format.

**Incremental delivery**: Each sub-phase ends with a commit that independently satisfies FR-019 (buildable and runnable state). No phase should be batched — commit at every hop.

**Version hop sequence summary**:

| Task | Hop | Key Change |
|---|---|---|
| T007–T009 | 2 → 4 | Stricter template types |
| T010–T012 | 4 → 5 | HttpModule → HttpClientModule |
| T013–T017 | 5 → 6 | `angular-cli.json` → `angular.json`; RxJS 6 |
| T018–T019 | 6 → 7 | — |
| T020–T021 | 7 → 8 | — |
| T022–T026 | 8 → 9 | Ivy; `@angular/http` removed; zone.js import path |
| T027–T028 | 9 → 10 | — |
| T029–T030 | 10 → 11 | — |
| T031–T032 | 11 → 12 | Webpack 5 |
| T033–T036 | — | TSLint → ESLint (must precede v13) |
| T037–T038 | 12 → 13 | `tslint` builder removed |
| T039–T041 | 13 → 14 | Typed reactive forms |
| T042–T049 | 14 → 15 | MDC rebuild; Bootstrap/FA/sharebuttons removed |
| T050–T051 | 15 → 16 | TypeScript 5.0+ |
| T052–T054 | 16 → 17 | esbuild application builder |
| T055–T056 | 17 → 18 | `browserTarget` → `buildTarget`; M2 prefix |
| T057–T062 | — | Protractor → Playwright |
| T063–T070 | — | Karma → Vitest |
| T071–T073 | 18 → 19 | Protractor builder removed; `mat.theme()` API |
