# Data Model: Modernize Dependencies

**Phase 1 output** | Branch: `001-modernize-dependencies` | Date: 2026-02-27

## Summary

This is an infrastructure upgrade spec. **No data model changes are introduced.**
All existing entities and their relationships are preserved exactly as-is.

This document records the existing data model as a reference baseline, ensuring:
- Compliance with FR-009 (base64 URLs must continue to work identically)
- Compliance with FR-010 (recipe scaling arithmetic must be identical)
- A clear regression target for testing

---

## Existing Entities (preserved unchanged)

### Recipe

The top-level entity. Serialised to JSON and base64-encoded into the URL.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Display name of the recipe |
| `description` | `string` | No | HTML description text |
| `numberOfServes` | `number` | No | Base number of serves the recipe yields |
| `baseIngredient` | `MeasuredRecipeIngredient` | Yes | The ingredient used as the scaling base |
| `additionalIngredients` | `IRecipeIngredient[]` | Yes | All other ingredients (can be measured or scaled) |

### MeasuredRecipeIngredient (implements IRecipeIngredient)

A concrete ingredient defined by an absolute measure. Used as `baseIngredient`
and may appear in `additionalIngredients`.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Ingredient name |
| `description` | `string` | No | Notes (e.g., brand, specification) |
| `measure` | `number` | Yes | Absolute quantity |
| `unitOfMeasure` | `string` | Yes | Unit (e.g., "ml", "g", "dashes") |

### ScaledRecipeIngredient (implements IRecipeIngredient)

An ingredient whose quantity is expressed as a ratio relative to the base
ingredient. Not directly visible in the URL — resolved at render time by the
view model.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Ingredient name |
| `description` | `string` | No | Notes |
| `scaleFactor` | `number` | Yes | Ratio relative to base ingredient measure |

### IRecipeIngredient (interface)

Marker interface satisfied by both `MeasuredRecipeIngredient` and
`ScaledRecipeIngredient`. Provides polymorphic typing for `additionalIngredients`.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Ingredient name |
| `description` | `string` | No | Notes |

---

## Serialisation Contract

The `Recipe` object is serialised as:

```
URL path parameter = btoa(JSON.stringify(recipe))
```

Where `btoa` is the browser's native Base64 encoder and `JSON.stringify` produces
compact JSON with no extra whitespace.

**This serialisation scheme MUST NOT change.** Any Angular Router or TypeScript
API changes during the upgrade must be verified to leave `btoa`/`JSON.stringify`
and `atob`/`JSON.parse` behaviour unchanged (FR-009, FR-010).

---

## Scaling State Machine

The scaling logic is stateless — all state is derived from the URL at load time:

```
1. URL param decoded  →  Recipe object
2. Recipe object      →  RecipeViewModel (sets scaledMeasure = measure for all ingredients)
3. User edits base ingredient measure  →  scaling factor = newMeasure / originalMeasure
4. All other ingredient scaledMeasures updated  →  scaledMeasure = scaleFactor × measure
5. If numberOfServes set  →  desiredNumberOfServes = numberOfServes × scalingFactor
```

The scaling arithmetic uses standard floating-point multiplication. No rounding
is applied at the model layer (rounding, if any, occurs in the view template).
This arithmetic must produce identical results post-upgrade (FR-010).
