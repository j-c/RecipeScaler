import { AbstractRecipeIngredient } from './abstract-recipe-ingredient';

/** Recipe ingredient that is defined by measurements */
export class MeasuredRecipeIngredient extends AbstractRecipeIngredient {
    /** Measure of ingredient. Must be greater than 0. */
    measure: number;

    /** Unit of measure (optional) */
    unitOfMeasure?: string;
}