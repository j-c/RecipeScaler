# Feature Specification: Modernize Dependencies

**Feature Branch**: `001-modernize-dependencies`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "I want to upgrade Angular and all dependencies to current supported versions. While this does not bring immediate business value to this app, it is an enabler to deliver future value."

## Context

RecipeScaler is a single-page Angular application that scales recipe
ingredient quantities. It has not been updated in over 10 years but
continues to function correctly in modern browsers. Recipes are encoded
in the URL via base64 querystring parameters — there is no backend.

The current dependency baseline is:

- **Angular**: 2.3.1 (initial release era)
- **Angular CLI**: 1.0.0-beta.28.3 (pre-release, uses legacy `angular-cli.json`)
- **TypeScript**: 2.0.3
- **RxJS**: 5.0.1
- **Angular Material**: 2.0.0-beta.1
- **Zone.js**: 0.7.2
- **Third-party**: `ng2-sharebuttons` (social sharing), `bootstrap-material-design` (styling/theming), Bootstrap 3 CSS (CDN), Font Awesome 4 (CDN)
- **Test stack**: Karma 1.2, Jasmine 2.5, Protractor 4.0

All of these dependencies are end-of-life. This blocks the ability to
add new features, apply security patches, or use modern development
tooling.

**This spec does not deliver direct user-facing value.** Its purpose
is to bring the project to a state where future feature work is
possible on a supported, maintained technology stack.

## Clarifications

### Session 2026-02-27

- Q: Should `ng2-sharebuttons` social sharing be replaced, removed, or deferred? → A: Defer — remove during upgrade; re-add via a dedicated feature spec later.
- Q: What should the post-upgrade styling stack be? → A: Angular Material only — remove Bootstrap 3 CDN and `bootstrap-material-design`; consolidate all styling onto Angular Material theming.
- Q: What should happen to Font Awesome 4 (CDN)? → A: Remove — drop Font Awesome entirely; replace any remaining icons with Angular Material icons.
- Q: Should Protractor be replaced or just removed? → A: Replace — migrate to the e2e framework recommended by the target Angular version; E2E coverage is critical for regression assurance during upgrade.
- Q: How strictly must visual appearance be preserved after the Bootstrap → Angular Material styling migration? → A: Loose — same layout intent and functional usability required; minor visual differences acceptable.

## Constitution Check

| Principle | How this spec addresses it |
|---|---|
| I. Behavior Preservation (NON-NEGOTIABLE) | FR-009 preserves base64 recipe URL contract; FR-010 requires identical scaling arithmetic; contract documented in `contracts/url-scheme.md`; SC-008 requires a passing smoke test |
| II. Incremental Migration | FR-019 requires each Angular major hop to be a discrete, buildable, revertible commit; SC-007 makes this measurable |
| III. Reproducible Baseline | FR-012 records Node version in repo; FR-013 requires lock file committed; SC-001 requires clean-checkout build in under 5 minutes |
| IV. Safety Net Before Speed | FR-011 requires a supported unit test runner; FR-018 requires Protractor replacement with a smoke test before the project is considered done |
| V. Simplicity & Pragmatism | Non-Goals section explicitly prohibits SSR, monorepo, new architecture; third-party removal reduces complexity; Angular built-in capabilities preferred |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buildable on Current Toolchain (Priority: P1)

As a developer, I need the project to install, build, and run on a
current, supported runtime and toolchain so that I can make changes
with confidence and access modern development tools.

**Why this priority**: Nothing else can happen until the project builds.
This is the foundational enabler for all subsequent work.

**Independent Test**: Clone the repo, run the install and build
commands, and launch the app. It either works or it does not.

**Acceptance Scenarios**:

1. **Given** a clean checkout of the repository on a current supported
   Node LTS runtime, **When** I run the install command followed by the
   build command, **Then** both complete with zero errors.
2. **Given** a successful build, **When** I run the development server
   command, **Then** the app starts and is accessible in a browser
   without console errors.
3. **Given** the app is running, **When** I navigate to the root URL
   without any recipe parameter, **Then** the app loads and displays
   its default state (empty recipe / edit mode).

---

### User Story 2 - Existing Recipes Still Work (Priority: P1)

As a user with bookmarked recipe URLs, I need my existing base64-encoded
recipe links to continue working identically after the upgrade so that
none of my saved recipes are lost or broken.

**Why this priority**: Equal to P1 — the constitution's Behavior
Preservation principle is NON-NEGOTIABLE. A build that works but breaks
existing URLs fails the upgrade.

**Independent Test**: Open a known recipe URL that works today in the
current deployment. After upgrade, open the same URL and verify the
recipe name, ingredients, quantities, and scaling all match exactly.

**Acceptance Scenarios**:

1. **Given** a recipe URL that currently works, **When** I open it in
   the upgraded app, **Then** the recipe name, description, base
   ingredient, and all additional ingredients display identically.
2. **Given** a loaded recipe, **When** I change the base ingredient
   quantity to trigger scaling, **Then** all ingredient quantities
   scale by the same ratios as they do in the current version.
3. **Given** a loaded recipe URL, **When** I copy the URL from the
   address bar, **Then** the URL is identical to the original (no
   format change, no re-encoding).

---

### User Story 3 - Tests Pass on Modern Test Runner (Priority: P2)

As a developer, I need the project's test suite to execute successfully
on a supported test runner so that I have a safety net for future
changes.

**Why this priority**: Tests are the safety net that enables confident
future feature work. Without them, every change carries regression risk.

**Independent Test**: Run the test command and verify all tests pass
with zero failures.

**Acceptance Scenarios**:

1. **Given** a clean install, **When** I run the unit test command,
   **Then** all existing tests pass (or tests that were removed have
   documented justification in upgrade notes).
2. **Given** the test suite, **When** I examine coverage, **Then** at
   least one test exercises the recipe scaling logic (ingredient
   quantity calculation).

---

### User Story 4 - Third-Party Libraries Resolved (Priority: P3)

As a developer, I need all third-party dependencies to be either
upgraded to maintained versions, replaced with modern alternatives, or
cleanly removed so that the project has no abandoned dependencies.

**Why this priority**: Abandoned libraries block future upgrades and
pose potential security risks. But functional parity comes first (P1/P2).

**Independent Test**: Inspect the final dependency list; every package
should have had an update within the last 12 months or be a well-known
stable package.

**Acceptance Scenarios**:

1. **Given** the package manifest after upgrade, **When** I audit
   dependencies, **Then** no package is unmaintained (no updates in
   over 2 years) or deprecated.
2. **Given** the app previously used social sharing (via
   `ng2-sharebuttons`), **When** I view a recipe after upgrade,
   **Then** the share buttons are cleanly removed with no rendering
   errors or orphaned UI elements, and a follow-up feature spec
   is created to re-add sharing later.
3. **Given** the app previously used `bootstrap-material-design` +
   CDN Bootstrap 3 for styling, **When** I view the app after upgrade,
   **Then** all styling is provided by Angular Material theming, the
   Bootstrap 3 CDN link and `bootstrap-material-design` package are
   removed, and the layout intent is preserved (forms usable, text
   readable, layout sensible) — minor visual differences are
   acceptable.

---

### Edge Cases

- What if a recipe URL uses characters that are handled differently by
  a newer version of Angular's router? The base64 decode/encode logic
  must be verified to produce bit-identical results.
- What if the legacy `bootstrap-material-design` CSS classes are deeply
  embedded in component templates? Removal may require template updates
  to achieve visual parity.
- What if the Angular-recommended e2e framework requires configuration
  that is incompatible with the SPA-with-no-router setup? The app
  uses a base64 param route; the smoke test must exercise this path.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST build and run on the current
  supported Node LTS version without errors.
- **FR-002**: The application MUST use a current, supported version of
  Angular (the latest stable major release at time of implementation).
- **FR-003**: All Angular ecosystem packages (router, forms, common,
  compiler, platform-browser, etc.) MUST be at versions compatible with
  the target Angular version.
- **FR-004**: TypeScript MUST be at a version supported by the target
  Angular version.
- **FR-005**: RxJS MUST be at a version supported by the target Angular
  version.
- **FR-006**: Zone.js MUST be at a version supported by the target
  Angular version.
- **FR-007**: The build tooling MUST use the current supported Angular
  CLI and its configuration format.
- **FR-008**: The legacy `angular-cli.json` configuration MUST be
  migrated to the current Angular workspace configuration format.
- **FR-009**: Base64-encoded recipe URLs that work in the current
  deployed version MUST continue to work identically after upgrade.
- **FR-010**: Recipe scaling arithmetic MUST produce identical results
  before and after upgrade.
- **FR-011**: The unit test suite MUST execute on a supported test
  runner. If the current test runner is no longer supported, it MUST
  be replaced.
- **FR-012**: The project's Node version and package manager version
  MUST be recorded in the repository.
- **FR-013**: A lock file MUST be committed and maintained.
- **FR-014**: `ng2-sharebuttons` MUST be removed during the upgrade.
  A follow-up feature spec MUST be created to re-add social sharing
  functionality using a maintained solution.
- **FR-015**: `bootstrap-material-design` MUST be removed. All styling
  previously provided by this package MUST be migrated to Angular
  Material theming.
- **FR-016**: The Bootstrap 3 CDN reference and the Font Awesome 4
  CDN reference MUST both be removed. Any icons previously served by
  Font Awesome MUST be replaced with Angular Material icons.
- **FR-017**: Angular Material MUST be upgraded to its current
  supported version, compatible with the target Angular version.
- **FR-018**: The Protractor e2e test suite MUST be removed (Protractor
  is officially deprecated) and replaced with the e2e framework
  recommended by the target Angular version at time of implementation.
  At minimum, the replacement suite MUST include one smoke test that:
  (a) loads the app, and (b) loads a recipe via a base64-encoded URL
  and verifies the recipe name and at least one ingredient are
  displayed correctly.
- **FR-019**: Each major Angular version upgrade step MUST leave the
  application in a buildable and runnable state (per Constitution
  Principle II).

### Non-Functional Requirements

- **NFR-001**: The visual styling after migration MUST preserve layout
  intent — all form inputs, labels, buttons, and recipe content must
  remain legible and usable. Minor differences in spacing, typography,
  and component appearance introduced by Angular Material defaults are
  acceptable without requiring custom CSS overrides.

### Non-Goals

- No new user-facing features are added in this spec.
- No visual redesign — layout intent and functional usability must be
  preserved; pixel-perfect parity with the current design is not
  required.
- No changes to the base64 URL encoding scheme.
- No introduction of a backend, build pipeline, or deployment
  infrastructure beyond what the build tooling provides.
- No migration to SSR, SSG, or any non-SPA architecture.
- No re-implementation of social sharing — removal only; re-add is a
  separate future spec.
- No comprehensive e2e test suite — minimum required is a smoke test
  covering app load and recipe URL rendering; full e2e coverage is a
  future spec.
- No restoration of deployment to GitHub Pages — the current
  `ng github-pages:deploy` command was removed in Angular 6 and will
  not be available post-upgrade. Deployability is a separate follow-up
  spec (suggested: `002-github-pages-deployment`).

### Assumptions

- The current LTS Node version at time of implementation is the target
  runtime (currently Node 22.x LTS as of February 2026).
- Angular 19.x is the current stable major release at time of writing.
  The target is whatever the latest stable major is when implementation
  begins.
- `ng2-sharebuttons` will be removed. A follow-up spec will evaluate
  `ngx-sharebuttons`, the Web Share API, or a custom solution for
  re-adding social sharing.
- `bootstrap-material-design` and the Bootstrap 3 CDN will be removed.
  All styling will be consolidated onto Angular Material theming.
  Template classes that reference Bootstrap CSS will need to be
  migrated to Angular Material equivalents.
- Font Awesome 4 (CDN) will be removed entirely. Any icons it provided
  will be replaced with Angular Material icons during the styling
  migration. The primary Font Awesome consumer (`ng2-sharebuttons`)
  is already being removed.
- `ts-helpers` is superseded by TypeScript's built-in `tslib` and can
  be replaced directly.
- `core-js` polyfills may no longer be needed for browsers targeted by
  current Angular versions, but this will be validated during planning.
- Protractor will be removed. The replacement e2e framework will be
  determined during planning based on what Angular 19.x officially
  supports via schematics at time of implementation (likely Playwright
  or Cypress — both have official Angular schematics). The minimum
  deliverable is a smoke test; the framework choice is a planning
  decision.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can clone the repo, install dependencies, and
  build the project in under 5 minutes on a current Node LTS runtime
  with zero manual workarounds.
- **SC-002**: All Angular ecosystem dependencies report as current
  supported versions (no deprecation warnings from `ng update` or
  `npm audit` for Angular packages).
- **SC-003**: 100% of existing recipe URLs tested produce identical
  recipe display and scaling behavior before and after upgrade.
- **SC-004**: The unit test suite passes with zero failures on the
  upgraded test runner.
- **SC-005**: Zero dependencies in `package.json` are unmaintained
  (no updates in over 2 years) or officially deprecated.
- **SC-006**: The app loads and renders its default state in under
  3 seconds on a standard broadband connection (no performance
  regression from the upgrade).
- **SC-007**: Every intermediate Angular major-version step (2→4, 4→5,
  …, N-1→N) is a discrete, revertible commit that independently
  passes install + build + start.
- **SC-008**: At least one passing e2e smoke test verifies that a
  base64-encoded recipe URL loads and renders the expected recipe
  name and at least one ingredient.
