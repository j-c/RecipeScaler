import { BaseRecipeIngredient } from './base-recipe-ingredient';

/** Recipe ingredient that is defined by measurements */
export interface MeasuredRecipeIngredient extends BaseRecipeIngredient {
    /** Measure of ingredient. Must be greater than 0. */
    measure: number;

    /** Unit of measure (optional) */
    unitOfMeasure?: string;
}