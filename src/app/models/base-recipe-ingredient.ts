import { RecipeIngredient } from './recipe-ingredient';

export interface BaseRecipeIngredient extends RecipeIngredient {
    /** Ingredient name */
    name: string;
    
    /** Ingredient description (optional) */
    description?: string;
}