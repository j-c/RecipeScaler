import { RecipeIngredientViewModel } from './recipe-ingredient-view-model';
import { RecipeIngredient } from '../models/measured-recipe-ingredient';

describe('RecipeIngredientViewModel', () => {
  const base: RecipeIngredient = { name: 'Flour', measure: 200, unitOfMeasure: 'g' };

  it('should create a base ingredient view model', () => {
    const vm = new RecipeIngredientViewModel(base);
    expect(vm.name).toBe('Flour');
    expect(vm.measure).toBe(200);
    expect(vm.unitOfMeasure).toBe('g');
    expect(vm.scaling).toBe(1.0);
    expect(vm.scaledMeasure).toBe(200);
  });

  it('should calculate scaling for additional ingredients', () => {
    const sugar: RecipeIngredient = { name: 'Sugar', measure: 100, unitOfMeasure: 'g' };
    const vm = new RecipeIngredientViewModel(sugar, base);
    expect(vm.scaling).toBe(0.5);
    expect(vm.scaledMeasure).toBe(100);
  });

  it('should handle missing unitOfMeasure', () => {
    const ingredient: RecipeIngredient = { name: 'Eggs', measure: 2 };
    const vm = new RecipeIngredientViewModel(ingredient, base);
    expect(vm.unitOfMeasure).toBe('');
  });
});
