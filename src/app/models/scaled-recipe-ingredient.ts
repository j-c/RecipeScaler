import { BaseRecipeIngredient } from './base-recipe-ingredient';

/** Recipe ingredient that is defined by scaling percentage with respect to recipe's base ingredient */
export interface ScaledRecipeIngredient extends BaseRecipeIngredient {
    /** Percentage scale with respect to base ingredient specified in recipe (0.0 == 0%, 1.0 = 100%). Must be greater than 0. */
    scaling: number;
}