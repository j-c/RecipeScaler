import { Recipe } from '../models/recipe';
import { RecipeIngredientViewModel } from './recipe-ingredient-view-model';

export class RecipeViewModel {
  private _nameId = '';
  get nameId(): string {
    return this._nameId;
  }

  private _name = '';
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    this._name = name;
    this._nameId = name.toLowerCase().replace(/[^a-z]/g, '');
  }

  description?: string;

  recipeNumberOfServes = 0;

  desiredNumberOfServes = 0;

  ingredients: RecipeIngredientViewModel[] = [];

  constructor(recipe: Recipe) {
    this.name = recipe.name;
    this.description = recipe.description;
    this.recipeNumberOfServes = recipe.numberOfServes || 0;
    this.desiredNumberOfServes = this.recipeNumberOfServes;

    if (!recipe.baseIngredient) {
      throw new Error('No base ingredient specified');
    } else if (recipe.baseIngredient.measure <= 0) {
      throw new Error('Base ingredient measure needs to be greater than 0');
    } else {
      this.ingredients.push(new RecipeIngredientViewModel(recipe.baseIngredient));
    }

    if (Array.isArray(recipe.additionalIngredients) && recipe.additionalIngredients.length > 0) {
      for (const ingredient of recipe.additionalIngredients) {
        this.ingredients.push(new RecipeIngredientViewModel(ingredient, recipe.baseIngredient));
      }
    }
  }
}
