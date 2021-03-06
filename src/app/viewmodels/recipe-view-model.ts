import { Recipe } from '../models/recipe';
import { IRecipeIngredient } from '../models/irecipe-ingredient'
import { RecipeIngredientViewModel } from './recipe-ingredient-view-model';

export class RecipeViewModel {
    private _nameId: string;
    get nameId(): string {
        return this._nameId;
    };

    private _name: string;
    get name(): string {
        return this._name;
    };
    set name(name: string) {
        this._name = name;
        this._nameId = name.toLowerCase().replace(/[^a-z]/g, '');
    }

    description?: string;

    recipeNumberOfServes?: number;

    desiredNumberOfServes?: number;

    ingredients: RecipeIngredientViewModel[];
    
    constructor(recipe: Recipe) {
        this.name = recipe.name;
        this.description = recipe.description;
        this.recipeNumberOfServes = recipe.numberOfServes || 0;
        this.desiredNumberOfServes = this.recipeNumberOfServes;

        this.ingredients = [];

        // Add base ingredients
        if (!recipe.baseIngredient) {
            throw "No base ingredient specified";
        } else if (recipe.baseIngredient.measure <= 0) {
            throw "Base ingredient measure needs to be greater than 0";
        } else {
            this.ingredients.push(new RecipeIngredientViewModel(recipe.baseIngredient));
        }

        // Add additional ingredients
        if (Array.isArray(recipe.additionalIngredients) && recipe.additionalIngredients.length > 0) {
            let ingredientArray = this.ingredients;
            recipe.additionalIngredients.forEach((e, i) => {
                ingredientArray.push(new RecipeIngredientViewModel(e, recipe.baseIngredient));
            });
        } else {
            console.warn("Recipe only contains base ingredient");
        }
    }
}