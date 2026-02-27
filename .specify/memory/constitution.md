<!--
  Sync Impact Report
  ═══════════════════
  Version change: 1.1.0 → 1.2.0
  Modified principles:
    - IV. Incremental Modernisation → IV. Pragmatic Modernisation
      (relaxed: large leaps tolerated when they simplify the
       process or reach the destination faster; codebase is tiny
       so risk of big jumps is low)
  Added sections: N/A
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ reviewed (no changes needed)
    - .specify/templates/spec-template.md ✅ reviewed (no changes needed)
    - .specify/templates/tasks-template.md ✅ reviewed (no changes needed)
  Follow-up TODOs: none
-->

# RecipeScaler Constitution

## Core Principles

### I. Simplicity First

This is a small SPA with very few lines of code. Every decision
MUST favour the simplest viable approach.

- YAGNI: do NOT add abstractions, services, or indirection layers
  unless a concrete, immediate need exists.
- New files or modules MUST earn their existence; prefer extending
  an existing file over creating a new one when the result stays
  under ~150 lines.
- No backend, no build-time API calls, no server-side rendering.
  The app MUST remain a purely static client-side bundle.

**Rationale**: A tiny codebase is its own best documentation.
Keeping it small preserves fast iteration and low maintenance cost.

### II. URL as Data Store (NON-NEGOTIABLE)

All recipe state MUST be encoded in the URL (currently base64 JSON
in a route parameter). There is no backend and no persistent
storage.

- The URL MUST be the single source of truth for recipe data.
- Any feature that requires server-side persistence is out of scope
  unless the constitution is amended.
- Shareable URLs MUST remain the primary distribution mechanism for
  recipes; link compatibility SHOULD be preserved across upgrades
  where feasible.

**Rationale**: This was a deliberate design choice to integrate
with the owner's recipe organisation scheme. It eliminates hosting
costs, auth, and data-management complexity.

### III. Buildable & Working

The application MUST ultimately build without errors and be
functional in a modern evergreen browser (Chrome, Firefox,
Safari, Edge latest two major versions).

**Bootstrap phase** (initial modernisation commits, e.g. porting
code into a fresh Angular CLI project):

- Temporary build breaks are tolerated.
- Simpler migration strategies (such as scaffolding a new project
  and copying source files in) are preferred over complex
  in-place upgrade chains when they reduce overall effort.
- The bootstrap phase ends when `ng build` succeeds and the
  default recipe renders correctly. All subsequent commits MUST
  maintain that baseline.

**Steady-state** (after bootstrap):

- `ng build` (or equivalent) MUST succeed with zero errors.
- The default recipe MUST render and the scaling interaction MUST
  work after every change.

**Rationale**: The gap between Angular v2 and current LTS is
large. Allowing temporary breakage during the initial port keeps
the migration approach simple and avoids convoluted multi-step
upgrade sequences. Once the app is running on modern tooling,
strict buildability resumes.

### IV. Pragmatic Modernisation

The codebase is tiny. Choose whichever upgrade path gets to a
working, modern result fastest—even if that means skipping
intermediate versions or porting into a brand-new project.

- Large version leaps (e.g. Angular v2 → current LTS in one move)
  are acceptable when the codebase is small enough that the whole
  app can be re-verified quickly.
- Incremental steps are fine too; pick the approach that minimises
  total effort, not the one with the most checkpoints.
- Preserve existing application behaviour and the URL contract
  unless an explicit decision is made to change it.

**Rationale**: With only a handful of source files, the risk of a
large leap is low—manual verification of the entire app takes
minutes, not hours. Optimise for speed to destination.

### V. Proportional Testing

Testing effort MUST be proportional to codebase size and risk.

- Core logic (recipe parsing, scaling arithmetic, URL
  encode/decode) MUST have unit tests.
- UI-only cosmetic changes do NOT require dedicated tests unless
  they alter behaviour.
- End-to-end tests are welcome but not mandatory for a project
  this small; prefer fast unit tests.

**Rationale**: Over-testing a micro-codebase wastes more time than
it saves. Focus test investment on the logic that matters.

## Technology Stack & Constraints

- **Framework**: Angular (upgrading from v2 → current LTS).
- **Language**: TypeScript (current stable).
- **Styling**: CSS (currently uses Bootstrap Material Design;
  may be replaced during modernisation).
- **Build tooling**: Angular CLI.
- **Runtime dependencies**: MUST be kept to an absolute minimum.
  Every new dependency MUST be justified against the Simplicity
  First principle.
- **Hosting target**: Static files only (GitHub Pages, Netlify,
  or equivalent). No server process.
- **Browser support**: Latest two major versions of Chrome,
  Firefox, Safari, and Edge.

## Development Workflow

- All modernisation and feature work happens on feature branches
  off the `spike/speckit-brownfield-rebuild` branch.
- Each logical change (dependency bump, feature, refactor) SHOULD
  be a single commit with a clear message.
- Before merging any change, verify:
  1. `ng build` succeeds.
  2. The app loads in a browser and the default recipe renders.
  3. Scaling a recipe ingredient updates all other ingredients.
- Use the `.specify/` workflow for planning and specifying new
  features; keep specs lightweight and proportional to the change.

## Governance

This constitution is the authoritative guide for all design and
implementation decisions in RecipeScaler. When in doubt, refer
back to these principles.

- **Amendments**: Any change to a principle MUST be documented in
  this file with an updated version number and date.
- **Versioning**: This constitution follows semantic versioning.
  MAJOR for principle removals/redefinitions, MINOR for new
  principles or material expansions, PATCH for clarifications.
- **Compliance**: Every spec and plan produced under `.specify/`
  MUST be checked against these principles before implementation
  begins.

**Version**: 1.2.0 | **Ratified**: 2026-02-27 | **Last Amended**: 2026-02-27
