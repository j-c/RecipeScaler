# Data Model: Upgrade Angular & All Dependencies

**Feature**: 001-angular-upgrade  
**Date**: 2026-02-27

## Overview

The data model is **unchanged** by this upgrade. All entities are pure TypeScript classes/interfaces with no Angular dependencies, so they port directly from Angular 2 to Angular 21 without modification.

## Entities

### IRecipeIngredient (interface)

The base contract for all recipe ingredients.

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Ingredient name |
| description | string | No | Optional description |

### AbstractRecipeIngredient (class)

Implements `IRecipeIngredient`. Base class for concrete ingredient types.

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Ingredient name |
| description | string | No | Optional description |

### MeasuredRecipeIngredient (extends AbstractRecipeIngredient)

An ingredient defined by an absolute measurement.

| Field | Type | Required | Description |
|---|---|---|---|
| measure | number | Yes | Amount (must be > 0 for base ingredient) |
| unitOfMeasure | string | No | Unit label (e.g. "ml", "dashes", "") |

### ScaledRecipeIngredient (extends AbstractRecipeIngredient)

An ingredient defined as a percentage of the base ingredient.

| Field | Type | Required | Description |
|---|---|---|---|
| scaling | number | Yes | Ratio relative to base ingredient (1.0 = 100%) |

### Recipe (class)

The top-level recipe entity, serialized as JSON → base64 in the URL.

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Recipe name |
| description | string | No | HTML description |
| numberOfServes | number | No | Number of servings the recipe yields |
| baseIngredient | MeasuredRecipeIngredient | Yes | The ingredient all others scale against |
| additionalIngredients | IRecipeIngredient[] | Yes | All other ingredients |

### Relationships

```text
Recipe
├── baseIngredient: MeasuredRecipeIngredient (1:1, required)
└── additionalIngredients: IRecipeIngredient[] (1:many)
    ├── MeasuredRecipeIngredient
    └── ScaledRecipeIngredient
```

### Validation Rules

- `Recipe.baseIngredient` MUST be present
- `Recipe.baseIngredient.measure` MUST be > 0
- `Recipe.additionalIngredients` MAY be empty

### State Transitions

N/A — recipes are immutable once decoded from the URL. Scaling is handled by view models, not by mutating the recipe model.

## View Models (unchanged)

### RecipeViewModel

Wraps a `Recipe` for display. Computed properties:
- `nameId`: lowercase alphanumeric version of name (for HTML IDs)
- `ingredients`: array of `RecipeIngredientViewModel` (base + additional)
- `recipeNumberOfServes` / `desiredNumberOfServes`: for serves scaling

### RecipeIngredientViewModel

Wraps an `IRecipeIngredient` for display with scaling state:
- `measure`, `unitOfMeasure`: original values
- `scaledMeasure`: current scaled value (mutable, drives UI input)
- `scaling`: ratio relative to base ingredient

## Serialization Format (URL contract — unchanged)

```text
URL: /r/{base64_payload}
Payload: btoa(JSON.stringify(recipe))
```

Example recipe JSON:
```json
{
  "name": "Manhattans for two",
  "description": "<p>Shake with ice...</p>",
  "baseIngredient": {
    "name": "Rittenhouse Rye whiskey",
    "description": "50% ABV",
    "measure": 120,
    "unitOfMeasure": "ml"
  },
  "additionalIngredients": [
    { "name": "Carpano Antica Formula vermouth", "measure": 53, "unitOfMeasure": "ml" },
    { "name": "Angostura bitters", "measure": 4, "unitOfMeasure": "dashes" }
  ],
  "numberOfServes": 2
}
```
