import { RecipeViewModel } from './recipe-view-model';
import { Recipe } from '../models/recipe';

describe('RecipeViewModel', () => {
  const testRecipe: Recipe = {
    name: 'Test Recipe',
    description: 'A test description',
    numberOfServes: 4,
    baseIngredient: { name: 'Flour', measure: 200, unitOfMeasure: 'g' },
    additionalIngredients: [
      { name: 'Sugar', measure: 100, unitOfMeasure: 'g' },
      { name: 'Eggs', measure: 2, unitOfMeasure: '' },
    ],
  };

  it('should create a view model from a recipe', () => {
    const vm = new RecipeViewModel(testRecipe);
    expect(vm.name).toBe('Test Recipe');
    expect(vm.description).toBe('A test description');
    expect(vm.recipeNumberOfServes).toBe(4);
    expect(vm.desiredNumberOfServes).toBe(4);
  });

  it('should generate a nameId from the name', () => {
    const vm = new RecipeViewModel(testRecipe);
    expect(vm.nameId).toBe('testrecipe');
  });

  it('should have all ingredients', () => {
    const vm = new RecipeViewModel(testRecipe);
    expect(vm.ingredients.length).toBe(3);
    expect(vm.ingredients[0].name).toBe('Flour');
    expect(vm.ingredients[1].name).toBe('Sugar');
    expect(vm.ingredients[2].name).toBe('Eggs');
  });

  it('should throw for missing base ingredient', () => {
    const badRecipe = { ...testRecipe, baseIngredient: undefined as never };
    expect(() => new RecipeViewModel(badRecipe)).toThrow();
  });

  it('should throw for zero measure base ingredient', () => {
    const badRecipe = {
      ...testRecipe,
      baseIngredient: { name: 'Flour', measure: 0, unitOfMeasure: 'g' },
    };
    expect(() => new RecipeViewModel(badRecipe)).toThrow();
  });

  it('should default numberOfServes to 0 when not provided', () => {
    const recipe: Recipe = {
      name: 'Simple',
      baseIngredient: { name: 'Water', measure: 100, unitOfMeasure: 'ml' },
      additionalIngredients: [],
    };
    const vm = new RecipeViewModel(recipe);
    expect(vm.recipeNumberOfServes).toBe(0);
  });
});
