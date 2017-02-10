import { IRecipeIngredient } from '../models/irecipe-ingredient';
import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { ScaledRecipeIngredient } from '../models/scaled-recipe-ingredient';

export class RecipeIngredientViewModel {
    name: string;
    description?: string;

    type: string;

    measure: number;
    unitOfMeasure: string;

    scaling: number;

    private baseIngredientMeasure: number;
    private isBaseIngredient: boolean;

    get scaledMeasure(): number {
        return this.isBaseIngredient ? this.measure : (this.baseIngredientMeasure * this.scaling);
    };

    constructor (recipeIngredient: IRecipeIngredient, baseIngredient?: MeasuredRecipeIngredient) {
        this.name = recipeIngredient.name;
        this.description = recipeIngredient.description;
        
        // Variables to make the subsequent if-else block neater
        let measuredIngredient: MeasuredRecipeIngredient;
        let scaledIngredient: ScaledRecipeIngredient;

        if (measuredIngredient = recipeIngredient as MeasuredRecipeIngredient) {
            this.measure = measuredIngredient.measure;
            this.unitOfMeasure = measuredIngredient.unitOfMeasure;

            // Populate properties with respect to base ingredient
            if (baseIngredient) {
                // TODO: Make scaling take metric prefix into account (ie: 50ml of 100g is 0.05% not 50%)
                this.scaling = this.measure / baseIngredient.measure;
            } else {
                this.scaling = 1.0;
            }
        } else if (scaledIngredient = recipeIngredient as ScaledRecipeIngredient) {
            this.scaling = scaledIngredient.scaling;

            // Populate properties with respect to base ingredient
            if (baseIngredient) {
                this.unitOfMeasure = baseIngredient.unitOfMeasure;
                this.measure = baseIngredient.measure * this.scaling;
            }
        } else {
            throw "Unknown recipe ingredient type"
        }

        if (baseIngredient) {
            this.baseIngredientMeasure = baseIngredient.measure;
        } else {
            this.isBaseIngredient = true;
        }
    }
}
