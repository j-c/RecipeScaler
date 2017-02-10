import { IRecipeIngredient } from './irecipe-ingredient';

export class AbstractRecipeIngredient implements IRecipeIngredient {
    /** Ingredient name */
    name: string;
    
    /** Ingredient description (optional) */
    description?: string;
}