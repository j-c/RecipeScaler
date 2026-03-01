import { IRecipeIngredient } from '../models/irecipe-ingredient';
import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { ScaledRecipeIngredient } from '../models/scaled-recipe-ingredient';

export class RecipeIngredientViewModel {
    name: string;
    description?: string;

    type?: string;

    measure: number;
    unitOfMeasure?: string;

    scaling: number;
    scaledMeasure: number;

    private baseIngredientMeasure?: number;
    private isBaseIngredient?: boolean;

    constructor (recipeIngredient: IRecipeIngredient, baseIngredient?: MeasuredRecipeIngredient) {
        this.name = recipeIngredient.name;
        this.description = recipeIngredient.description;
        
        // Duck-type check: MeasuredRecipeIngredient has 'measure', ScaledRecipeIngredient has 'scaling'
        if ('measure' in recipeIngredient) {
            const measuredIngredient = recipeIngredient as MeasuredRecipeIngredient;
            this.measure = measuredIngredient.measure;
            this.unitOfMeasure = measuredIngredient.unitOfMeasure;
            this.scaledMeasure = this.measure;

            // Populate properties with respect to base ingredient
            if (baseIngredient) {
                // TODO: Make scaling take metric prefix into account (ie: 50ml of 100g is 0.05% not 50%)
                this.scaling = this.measure / baseIngredient.measure;
            } else {
                this.scaling = 1.0;
            }
        } else if ('scaling' in recipeIngredient) {
            const scaledIngredient = recipeIngredient as ScaledRecipeIngredient;
            this.scaling = scaledIngredient.scaling;

            // Populate properties with respect to base ingredient
            if (!baseIngredient) {
                throw new Error("No base ingredient provided for ScaledRecipeIngredient");
            }
            this.unitOfMeasure = baseIngredient.unitOfMeasure;
            this.measure = baseIngredient.measure * this.scaling;
            this.scaledMeasure = this.measure;
        } else {
            throw new Error("Unknown recipe ingredient type");
        }

        if (baseIngredient) {
            this.baseIngredientMeasure = baseIngredient.measure;
        } else {
            this.isBaseIngredient = true;
        }
    }
}
