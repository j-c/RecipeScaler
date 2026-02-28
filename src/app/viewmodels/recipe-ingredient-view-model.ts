import { RecipeIngredient } from '../models/measured-recipe-ingredient';

export class RecipeIngredientViewModel {
  name: string;
  description?: string;

  measure: number;
  unitOfMeasure: string;

  scaling: number;
  scaledMeasure: number;

  constructor(ingredient: RecipeIngredient, baseIngredient?: RecipeIngredient) {
    this.name = ingredient.name;
    this.description = ingredient.description;
    this.measure = ingredient.measure;
    this.unitOfMeasure = ingredient.unitOfMeasure ?? '';
    this.scaledMeasure = this.measure;

    if (baseIngredient) {
      this.scaling = this.measure / baseIngredient.measure;
    } else {
      this.scaling = 1.0;
    }
  }
}

