import { Recipe } from '../models/recipe';
import { RecipeViewModel } from './recipe-view-model';

describe('RecipeViewModel', () => {
  const validRecipe: Recipe = {
    name: 'Test Recipe',
    description: 'desc',
    numberOfServes: 2,
    baseIngredient: {
      name: 'Base',
      measure: 100,
      unitOfMeasure: 'ml',
    },
    additionalIngredients: [
      {
        name: 'Addon',
        measure: 50,
        unitOfMeasure: 'ml',
      } as any,
    ],
  };

  it('should build nameId and ingredients for a valid recipe', () => {
    const vm = new RecipeViewModel(validRecipe);
    expect(vm.name).toBe('Test Recipe');
    expect(vm.nameId).toBe('testrecipe');
    expect(vm.ingredients.length).toBe(2);
    expect(vm.recipeNumberOfServes).toBe(2);
    expect(vm.desiredNumberOfServes).toBe(2);
  });

  it('should throw if base ingredient is missing', () => {
    const invalid = { ...validRecipe, baseIngredient: undefined } as unknown as Recipe;
    expect(() => new RecipeViewModel(invalid)).toThrow();
  });

  it('should throw if base ingredient measure is not greater than zero', () => {
    const invalid = {
      ...validRecipe,
      baseIngredient: {
        ...validRecipe.baseIngredient,
        measure: 0,
      },
    };
    expect(() => new RecipeViewModel(invalid)).toThrow();
  });

  it('should warn when there are no additional ingredients', () => {
    const originalWarn = console.warn;
    let warned = false;
    console.warn = () => {
      warned = true;
    };

    try {
      const vm = new RecipeViewModel({
        ...validRecipe,
        additionalIngredients: [],
      });
      expect(vm.ingredients.length).toBe(1);
      expect(warned).toBe(true);
    } finally {
      console.warn = originalWarn;
    }
  });

  it('should apply scaling from a changed ingredient', () => {
    const vm = new RecipeViewModel(validRecipe);
    const first = vm.ingredients[0];
    const second = vm.ingredients[1];

    first.scaledMeasure = first.measure * 2;
    vm.applyScalingFromIngredient(first);

    expect(second.scaledMeasure).toBe(second.measure * 2);
    expect(vm.desiredNumberOfServes).toBe(4);
  });

  it('should apply scaling from serves change', () => {
    const vm = new RecipeViewModel(validRecipe);
    vm.applyScalingFromServes(1);

    expect(vm.ingredients[0].scaledMeasure).toBe(50);
    expect(vm.ingredients[1].scaledMeasure).toBe(25);
  });
});
