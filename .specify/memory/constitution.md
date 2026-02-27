<!--
  Sync Impact Report
  ===================
  Version change: N/A → 1.0.0 (initial ratification)
  Modified principles: N/A (all new)
  Added sections:
    - Core Principles (5 principles)
    - Upgrade Strategy
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check
      section will be populated from principles at plan time)
    - .specify/templates/spec-template.md ✅ compatible (no changes needed)
    - .specify/templates/tasks-template.md ✅ compatible (phase structure
      aligns with incremental upgrade approach)
    - .specify/templates/commands/ — directory does not exist; no action
  Follow-up TODOs: none
-->

# RecipeScaler Constitution

## Core Principles

### I. Behavior Preservation (NON-NEGOTIABLE)

The application works today on modern browsers. Every change — whether
an upgrade, refactor, or new feature — MUST preserve existing behavior
unless a spec explicitly scopes a behavioral change.

- The base64-encoded querystring recipe scheme MUST remain functional;
  URLs that work today MUST continue to work after any change.
- Recipe scaling arithmetic MUST produce identical results before and
  after any migration step.
- The app MUST remain a self-contained SPA with no backend dependency.
  This is a deliberate design choice, not a limitation.
- Verification: `ng build` succeeds, app loads in a browser, and an
  existing recipe URL renders correctly.

### II. Incremental Migration

All dependency upgrades MUST proceed in small, reversible increments.
No "big-bang" upgrade PRs.

- Angular MUST be upgraded one major version at a time (2→4→5→…→current)
  following official migration guides. Version 3 was skipped by Angular
  itself; that is the only acceptable skip.
- Each upgrade step MUST be a discrete, individually-revertible commit
  (or small PR) that leaves the app in a buildable-and-runnable state.
- Only one primary upgrade axis per spec: runtime (Node), build tooling
  (CLI/Webpack), framework (Angular major), or ancillary library
  (RxJS, Angular Material, etc.). Coupling is permitted only when an
  official migration guide requires it (e.g., Angular + RxJS together).
- If an upgrade breaks the build or tests, the upgrade MUST be reverted
  or fixed before moving on. No "we'll fix it later" partial states.

### III. Reproducible Baseline

The project MUST be buildable from a clean checkout at all times.

- The required Node and package-manager versions MUST be recorded in the
  repo (e.g., `.nvmrc`, `engines` field in `package.json`, or a
  `README` section).
- `npm install` (or the chosen package manager) followed by `ng build`
  MUST succeed with zero manual intervention on the recorded toolchain.
- Lock files (`package-lock.json` or equivalent) MUST be committed and
  kept up to date.

### IV. Safety Net Before Speed

A minimum verification gate MUST exist before and after every upgrade
or feature change.

- At minimum, these commands MUST pass after every merged change:
  `install`, `build`, and `start` (app loads without console errors).
- Unit tests (`ng test`) MUST pass if they exist; broken tests MUST be
  fixed or explicitly removed with justification, never left red.
- Before beginning feature work (post-modernization), at least one unit
  test MUST cover recipe scaling logic and at least one smoke test MUST
  verify the app loads a recipe from a querystring.
- E2E tests are aspirational during the upgrade phase. If the existing
  Protractor e2e suite breaks due to tooling changes, it MAY be removed
  and replaced with a modern alternative (e.g., Cypress, Playwright)
  in a dedicated spec.

### V. Simplicity & Pragmatism

Complexity MUST be justified. This is a small, focused utility — treat
it as one.

- Do not introduce abstractions, patterns, or dependencies beyond what
  the current feature set requires (YAGNI).
- Prefer Angular's built-in capabilities over third-party libraries
  when the built-in solution is adequate.
- The project MUST remain a single-project Angular workspace (no
  monorepo, no micro-frontends) unless a spec explicitly justifies
  otherwise.
- When an upgrade path offers multiple options, choose the one with the
  least structural change to the existing codebase.

## Upgrade Strategy

This section governs the modernization phase specifically (Angular 2 →
current supported versions). It supplements the Core Principles above.

- **Upgrade sequence**: Node runtime → Angular CLI / build tooling →
  Angular framework (major-by-major) → TypeScript (aligned to Angular
  requirements) → RxJS → Angular Material → other third-party
  libraries.
- **Angular Material special case**: The project currently uses
  `@angular/material@2.0.0-beta.1`. This package was rebranded and
  restructured significantly. A dedicated spec MUST handle its
  migration (or removal/replacement) rather than treating it as a
  routine bump.
- **Third-party triage**: `ng2-sharebuttons` and
  `bootstrap-material-design` are legacy packages. Each MUST be
  evaluated in a spec: migrate to a maintained successor, replace with
  a simpler alternative, or remove if unused.
- **Config migration**: The project uses the legacy `angular-cli.json`
  format. Migration to `angular.json` MUST happen as part of the
  Angular CLI upgrade spec (typically Angular 6).
- **Test tooling**: Karma + Jasmine is the current test runner. During
  upgrades, keep it working. If a major Angular version deprecates or
  drops Karma support, a spec MUST plan the migration to an
  alternative (e.g., Jest, Web Test Runner).

## Development Workflow

### Definition of Done (for upgrade specs)

A spec is complete when all of the following are true:

1. `npm install` succeeds from a clean `node_modules`.
2. `ng build` (or equivalent) succeeds with no errors.
3. `ng serve` launches the app and an existing recipe URL loads
   correctly.
4. `ng test` passes (or tests have been explicitly updated/removed
   with justification).
5. An "Upgrade Notes" section is added to the spec documenting: what
   changed, the new version matrix, any manual steps, and known
   issues.

### Definition of Done (for feature specs)

1. All acceptance criteria from the spec are met.
2. The build and test gates above still pass.
3. Existing recipe URLs still work (Principle I).

### Rollback

- Every upgrade spec MUST state how to revert (typically: revert the
  commit and restore the previous lock file).
- Partial migrations (where the app does not build or run) MUST NOT
  be merged.

### Commit Hygiene

- Use conventional commit messages (e.g., `chore: upgrade Angular
  4→5`, `feat: add print-friendly view`).
- Each logical upgrade step is one commit or squashed PR.

## Governance

This constitution is the authoritative reference for project decisions.
All specs, plans, and code changes MUST be consistent with its
principles.

- **Amendments**: Any principle may be amended by creating a spec that
  proposes the change, documents the rationale, and updates this file.
  The constitution version MUST be incremented per the versioning
  policy below.
- **Versioning policy**: MAJOR for principle removals or incompatible
  redefinitions; MINOR for new principles or materially expanded
  guidance; PATCH for clarifications, wording, or typo fixes.
- **Compliance review**: Each spec and plan MUST include a
  "Constitution Check" section that maps deliverables to applicable
  principles and confirms compliance.
- **Precedence**: If a spec conflicts with this constitution, the
  constitution wins unless the spec explicitly proposes an amendment.

**Version**: 1.0.0 | **Ratified**: 2026-02-27 | **Last Amended**: 2026-02-27
