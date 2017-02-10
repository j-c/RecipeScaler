import { Component, OnInit } from '@angular/core';

import { Recipe } from '../models/recipe';
import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { RecipeViewModel } from '../viewmodels/recipe-view-model';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent implements OnInit {

  recipeViewModel: RecipeViewModel;

  constructor() { 
    this.recipeViewModel = new RecipeViewModel(recipe);
  }

  ngOnInit() {
  }

}


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

var recipe: Recipe = {
  name: "Test recipe",
  description: "dadadad",
  baseIngredient: baseIngredient,
  additionalIngredients: [secondIngredient]
};
console.log(recipe);