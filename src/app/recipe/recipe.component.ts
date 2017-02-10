import { Component, OnInit } from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';

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

  recipeViewModel: RecipeViewModel;

  constructor(public location: Location) { 
    this.recipeViewModel = new RecipeViewModel(recipe);
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

  ngOnInit() {
  }

}

// DEV:
var baseIngredient: MeasuredRecipeIngredient = {
    name: "base ingredient",
    description: "ingredient description",
    measure: 100,
    unitOfMeasure: "g"
};

var secondIngredient: MeasuredRecipeIngredient = {
    name: "second ingredient",
    description: "ingredient description",
    measure: 50,
    unitOfMeasure: "ml"
};

var thirdIngredient: MeasuredRecipeIngredient = {
    name: "third ingredient",
    measure: 70,
    unitOfMeasure: "ml"
};

var recipe: Recipe = {
  name: "Test recipe",
  description: "<p>dadadad <strong>aaaa</strong> asdsada</p><script>alert(1);</script><ol><li>123</li></ol>",
  baseIngredient: baseIngredient,
  additionalIngredients: [secondIngredient, thirdIngredient],
  numberOfServes: 10
};