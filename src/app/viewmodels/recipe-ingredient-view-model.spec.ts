import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { RecipeIngredientViewModel } from './recipe-ingredient-view-model';

describe('RecipeIngredientViewModel', () => {
  const base: MeasuredRecipeIngredient = {
    name: 'Base',
    measure: 100,
    unitOfMeasure: 'ml',
  };

  it('should use 1.0 scaling for base measured ingredient', () => {
    const vm = new RecipeIngredientViewModel(base);
    expect(vm.measure).toBe(100);
    expect(vm.scaledMeasure).toBe(100);
    expect(vm.scaling).toBe(1);
    expect(vm.unitOfMeasure).toBe('ml');
  });

  it('should compute scaling from base ingredient when provided', () => {
    const ingredient: MeasuredRecipeIngredient = {
      name: 'Addon',
      measure: 25,
      unitOfMeasure: 'ml',
    };

    const vm = new RecipeIngredientViewModel(ingredient, base);
    expect(vm.measure).toBe(25);
    expect(vm.scaling).toBe(0.25);
    expect(vm.scaledMeasure).toBe(25);
  });

  it('should preserve optional description', () => {
    const ingredient: MeasuredRecipeIngredient = {
      name: 'Bitter',
      description: 'Aromatic',
      measure: 4,
      unitOfMeasure: 'dashes',
    };

    const vm = new RecipeIngredientViewModel(ingredient, base);
    expect(vm.description).toBe('Aromatic');
  });
});
