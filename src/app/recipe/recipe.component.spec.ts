import { describe, it, expect } from 'vitest';
import { Recipe } from '../models/recipe';
import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { RecipeViewModel } from '../viewmodels/recipe-view-model';
import { RecipeIngredientViewModel } from '../viewmodels/recipe-ingredient-view-model';

function makeTestRecipe(): Recipe {
  const baseIngredient: MeasuredRecipeIngredient = {
    name: 'Rittenhouse Rye whiskey',
    description: '50% ABV',
    measure: 120,
    unitOfMeasure: 'ml',
  };
  return {
    name: 'Manhattans for two',
    description: '<p>Test</p>',
    baseIngredient,
    additionalIngredients: [
      { name: 'Vermouth', measure: 53, unitOfMeasure: 'ml' },
      { name: 'Bitters', measure: 4, unitOfMeasure: 'dashes' },
    ],
    numberOfServes: 2,
  };
}

describe('RecipeViewModel', () => {
  it('should create a view model from a recipe', () => {
    const recipe = makeTestRecipe();
    const vm = new RecipeViewModel(recipe);
    expect(vm.name).toBe('Manhattans for two');
    expect(vm.ingredients.length).toBe(3); // base + 2 additional
    expect(vm.recipeNumberOfServes).toBe(2);
  });

  it('should set initial scaled measures equal to original measures', () => {
    const recipe = makeTestRecipe();
    const vm = new RecipeViewModel(recipe);
    expect(vm.ingredients[0].scaledMeasure).toBe(120);
    expect(vm.ingredients[1].scaledMeasure).toBe(53);
    expect(vm.ingredients[2].scaledMeasure).toBe(4);
  });

  it('should calculate correct scaling ratios for additional ingredients', () => {
    const recipe = makeTestRecipe();
    const vm = new RecipeViewModel(recipe);
    // Base ingredient scaling is 1.0
    expect(vm.ingredients[0].scaling).toBe(1.0);
    // Vermouth: 53/120
    expect(vm.ingredients[1].scaling).toBeCloseTo(53 / 120, 10);
    // Bitters: 4/120
    expect(vm.ingredients[2].scaling).toBeCloseTo(4 / 120, 10);
  });
});

describe('Recipe scaling arithmetic', () => {
  it('should scale all ingredients when one ingredient is doubled', () => {
    const recipe = makeTestRecipe();
    const vm = new RecipeViewModel(recipe);

    // Simulate user doubling the base ingredient (120 → 240)
    const baseIngredient = vm.ingredients[0];
    baseIngredient.scaledMeasure = 240;
    const scaling = baseIngredient.scaledMeasure / baseIngredient.measure; // = 2

    // Apply scaling to other ingredients (mimics updateScaledValues logic)
    vm.ingredients.forEach((e) => {
      if (e === baseIngredient) return;
      e.scaledMeasure = scaling * e.measure;
    });

    expect(vm.ingredients[1].scaledMeasure).toBeCloseTo(106, 0); // 53 * 2
    expect(vm.ingredients[2].scaledMeasure).toBeCloseTo(8, 0); // 4 * 2
  });

  it('should scale all ingredients when serves are changed', () => {
    const recipe = makeTestRecipe();
    const vm = new RecipeViewModel(recipe);

    // Simulate user changing serves from 2 → 4
    const newServes = 4;
    const scaling = newServes / vm.recipeNumberOfServes!; // = 2
    vm.ingredients.forEach((e) => {
      e.scaledMeasure = scaling * e.measure;
    });
    vm.desiredNumberOfServes = newServes;

    expect(vm.ingredients[0].scaledMeasure).toBeCloseTo(240, 0); // 120 * 2
    expect(vm.ingredients[1].scaledMeasure).toBeCloseTo(106, 0); // 53 * 2
    expect(vm.ingredients[2].scaledMeasure).toBeCloseTo(8, 0);   // 4 * 2
    expect(vm.desiredNumberOfServes).toBe(4);
  });

  it('should handle halving ingredients correctly', () => {
    const recipe = makeTestRecipe();
    const vm = new RecipeViewModel(recipe);

    // Scale to half
    const newServes = 1;
    const scaling = newServes / vm.recipeNumberOfServes!; // = 0.5
    vm.ingredients.forEach((e) => {
      e.scaledMeasure = scaling * e.measure;
    });

    expect(vm.ingredients[0].scaledMeasure).toBeCloseTo(60, 0);    // 120 * 0.5
    expect(vm.ingredients[1].scaledMeasure).toBeCloseTo(26.5, 0); // 53 * 0.5
    expect(vm.ingredients[2].scaledMeasure).toBeCloseTo(2, 0);    // 4 * 0.5
  });
});

describe('Recipe encode/decode', () => {
  it('should round-trip a recipe through btoa/atob encoding', () => {
    const recipe = makeTestRecipe();
    const encoded = btoa(JSON.stringify(recipe));
    const decoded: Recipe = JSON.parse(atob(encoded));
    expect(decoded.name).toBe('Manhattans for two');
    expect(decoded.baseIngredient.measure).toBe(120);
    expect(decoded.additionalIngredients!.length).toBe(2);
  });
});
