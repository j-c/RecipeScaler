import { RecipeIngredient } from './measured-recipe-ingredient';

export interface Recipe {
  /** Name of recipe */
  name: string;

  /** Recipe description (optional) */
  description?: string;

  /** Number of serves recipe yields (optional) */
  numberOfServes?: number;

  /** Base ingredient to scale all others against */
  baseIngredient: RecipeIngredient;

  /** All other ingredients used by the recipe */
  additionalIngredients: RecipeIngredient[];
}

