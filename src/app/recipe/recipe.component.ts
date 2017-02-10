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
    private route: ActivatedRoute
  ) { 
    this.recipe = recipe;

    this.generateUrlForRecipe(recipe);
  }

  ngOnInit() {
    try {
      var base64Recipe: string = this.route.snapshot.params['base64recipe'];
      if (base64Recipe && base64Recipe.length > 0) {
        var parsedRecipe = JSON.parse(atob(base64Recipe));
        this.recipe = parsedRecipe;
        console.log("Recipe successfuly parsed from route param.");
      } else {
        console.log("No recipe in route param.");
      }
    }
    catch (ex) {
      console.error("Could not parse recipe in route param.");
      //this.recipe = new Recipe();
    }
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
    var path = window.location.pathname;
    var splitPath = path.split('/');
    splitPath.pop() // Drop the last element (where the recipe is)
    var routePath = splitPath.join('/');
    return `${window.location.origin}${routePath}/${btoa(JSON.stringify(recipe))}`;
  }

  editRecipe(recipe: Recipe): void {
    this.editMode = true;
  }

  saveRecipe(): void {
    this.editMode = false;
    try {
      if (this.recipeJson && this.recipeJson.length > 0) {
        this.recipe = JSON.parse(this.recipeJson);
      }
    }
    catch (ex) {
      console.error(ex);
      window.alert("Error in Recipe JSON.");
    }
  }
}

// Default:
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

var recipe: Recipe = {
  name: "Manhattans for two",
  description: "<p>Shake with ice and serve in a chilled coupe glass.</p><p>From Liquid Intelligence by Dave Arnold</p>",
  baseIngredient: baseIngredient,
  additionalIngredients: additionalIngredients,
  numberOfServes: 2
};

var base64 = "eyJuYW1lIjoiTWFuaGF0dGFucyBmb3IgdHdvIiwiZGVzY3JpcHRpb24iOiI8cD5TaGFrZSB3aXRoIGljZSBhbmQgc2VydmUgaW4gYSBjaGlsbGVkIGNvdXBlIGdsYXNzLjwvcD48cD5Gcm9tIExpcXVpZCBJbnRlbGxpZ2VuY2UgYnkgRGF2ZSBBcm5vbGQ8L3A+IiwiYmFzZUluZ3JlZGllbnQiOnsibmFtZSI6IlJpdHRlbmhvdXNlIFJ5ZSB3aGlza2V5IiwiZGVzY3JpcHRpb24iOiI1MCUgQUJWIiwibWVhc3VyZSI6MTIwLCJ1bml0T2ZNZWFzdXJlIjoibWwifSwiYWRkaXRpb25hbEluZ3JlZGllbnRzIjpbeyJuYW1lIjoiQ2FycGFubyBBbnRpY2EgRm9ybXVsYSB2ZXJtb3V0aCIsImRlc2NyaXB0aW9uIjoiMTYuNSUgQUJWIiwibWVhc3VyZSI6NTMsInVuaXRPZk1lYXN1cmUiOiJtbCJ9LHsibmFtZSI6IkFuZ29zdHVyYSBiaXR0ZXJzIiwibWVhc3VyZSI6NCwidW5pdE9mTWVhc3VyZSI6ImRhc2hlcyJ9LHsibmFtZSI6IkJyYW5kaWVkIGNoZXJyaWVzIG9yIG9yYW5nZSB0d2lzdHMiLCJtZWFzdXJlIjoyLCJ1bml0T2ZNZWFzdXJlIjoiIn1dLCJudW1iZXJPZlNlcnZlcyI6Mn0=";