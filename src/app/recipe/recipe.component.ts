import { Component, OnInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Recipe } from '../models/recipe';
import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { RecipeViewModel } from '../viewmodels/recipe-view-model';
import { RecipeIngredientViewModel } from '../viewmodels/recipe-ingredient-view-model';

@Component({
  selector: 'app-recipe',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {

  private _recipe: Recipe;
  get recipe(): Recipe {
    return this._recipe;
  }
  set recipe(recipe: Recipe) {
    this._recipe = recipe;
    this.recipeViewModel = new RecipeViewModel(recipe);
  }

  recipeViewModel: RecipeViewModel;
  
  recipeJson: string;

  editMode: boolean = false;

  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) { 
    // nothing
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      try {
        var base64Recipe: string = params['base64recipe'];
        if (base64Recipe && base64Recipe.length > 0) {
          var parsedRecipe = RecipeComponent.decodeRecipe(base64Recipe);
          this.recipe = parsedRecipe;
          console.log("Recipe successfuly parsed from route param.");
        } else {
          console.log("No recipe in route param, using default.");
        }
      }
      catch (ex) {
        console.error("Could not parse recipe in route param, using default.");
      }

      // No recipe, use default
      if (!this.recipe) {
        this.navigateToRecipe(RecipeComponent.defaultRecipe);
      }
    })
  }

  updateScaledValues(ingredient: RecipeIngredientViewModel): void {
    var scaling = ingredient.scaledMeasure / ingredient.measure;
    this.recipeViewModel.ingredients.forEach((e, i) => {
      if (e === ingredient) return; // Do no calculate scaled value for the ingredient that is scaled against
      e.scaledMeasure = scaling * e.measure;
    });
    if (this.recipeViewModel.recipeNumberOfServes > 0) {
      this.recipeViewModel.desiredNumberOfServes = this.recipeViewModel.recipeNumberOfServes * scaling;
    }
  }

  updateServes(newServes: number): void {
    var scaling = newServes / this.recipeViewModel.recipeNumberOfServes;    
      this.recipeViewModel.ingredients.forEach((e, i) => {
      e.scaledMeasure = scaling * e.measure;
    });
  }

  generateUrlForRecipe(recipe: Recipe): string {
    /*
    var path = window.location.pathname;
    var routePath = path.slice(0, path.indexOf('/r') + 2);
    return `${window.location.origin}${routePath}/${RecipeComponent.encodeRecipe(recipe)}`;
    */
    return window.location.origin + window.location.pathname;
  }

  editRecipe(recipe: Recipe): void {
    this.editMode = true;
  }

  saveRecipe(): void {
    this.editMode = false;
    try {
      if (this.recipeJson && this.recipeJson.length > 0) {
        let newRecipe: Recipe = JSON.parse(this.recipeJson);
        this.navigateToRecipe(newRecipe);
      }
    }
    catch (ex) {
      console.error(ex);
      window.alert("Error in Recipe JSON.");
    }
  }

  navigateToRecipe(recipe: Recipe): void {
    this.router.navigate(['/r', RecipeComponent.encodeRecipe(recipe)]);
  }

  static encodeRecipe(recipe: Recipe):string {
    return btoa(JSON.stringify(recipe));
  }

  static decodeRecipe(encodedRecipe: string): Recipe {
    return JSON.parse(atob(encodedRecipe));
  }

  /** Default recipe */
  static get defaultRecipe(): Recipe {
    var baseIngredient: MeasuredRecipeIngredient = {
        name: "Rittenhouse Rye whiskey",
        description: "50% ABV",
        measure: 120,
        unitOfMeasure: "ml"
    };
    var additionalIngredients = [];
    additionalIngredients.push({
        name: "Carpano Antica Formula vermouth",
        description: "16.5% ABV",
        measure: 53,
        unitOfMeasure: "ml"
    });
    additionalIngredients.push({
        name: "Angostura bitters",
        measure: 4,
        unitOfMeasure: "dashes"
    });
    additionalIngredients.push({
        name: "Brandied cherries or orange twists",
        measure: 2,
        unitOfMeasure: ""
    });

    var defaultRecipe: Recipe = {
      name: "Manhattans for two",
      description: "<p>Shake with ice and serve in a chilled coupe glass.</p><p>From Liquid Intelligence by Dave Arnold</p>",
      baseIngredient: baseIngredient,
      additionalIngredients: additionalIngredients,
      numberOfServes: 2
    };
    return defaultRecipe;
  }
}


