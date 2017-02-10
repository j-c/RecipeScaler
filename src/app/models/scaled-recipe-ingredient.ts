import { AbstractRecipeIngredient } from './abstract-recipe-ingredient';

/** Recipe ingredient that is defined by scaling percentage with respect to recipe's base ingredient */
export class ScaledRecipeIngredient extends AbstractRecipeIngredient {
    /** Percentage scale with respect to base ingredient specified in recipe (0.0 == 0%, 1.0 = 100%). Must be greater than 0. */
    scaling: number;
}