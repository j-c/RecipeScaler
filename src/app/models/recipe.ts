import { IRecipeIngredient } from './irecipe-ingredient';
import { MeasuredRecipeIngredient } from './measured-recipe-ingredient';

export class Recipe {
    /** Name of recipe */
    name: string;
    
    /** Recipe description (optional) */
    description?: string;

    /** Number of serves recipe yeilds (optional) */
    numberOfServes?: number

    /** Base ingredient to scale all others against. Must be defined by measure. */
    baseIngredient: MeasuredRecipeIngredient;

    /** All other ingredients used by the recipe */
    additionalIngredients: IRecipeIngredient[];
}

