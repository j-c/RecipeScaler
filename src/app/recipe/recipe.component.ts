import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PercentPipe, JsonPipe } from '@angular/common';

import { Recipe } from '../models/recipe';
import { RecipeIngredient } from '../models/measured-recipe-ingredient';
import { RecipeViewModel } from '../viewmodels/recipe-view-model';
import { RecipeIngredientViewModel } from '../viewmodels/recipe-ingredient-view-model';

@Component({
  selector: 'app-recipe',
  imports: [FormsModule, PercentPipe, JsonPipe],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.css'
})
export class RecipeComponent implements OnInit {

  private _recipe!: Recipe;
  get recipe(): Recipe {
    return this._recipe;
  }
  set recipe(recipe: Recipe) {
    this._recipe = recipe;
    this.recipeViewModel = new RecipeViewModel(recipe);
  }

  recipeViewModel!: RecipeViewModel;

  recipeJson = '';

  editMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      try {
        const base64Recipe: string = params['base64recipe'];
        if (base64Recipe && base64Recipe.length > 0) {
          const parsedRecipe = RecipeComponent.decodeRecipe(base64Recipe);
          this.recipe = parsedRecipe;
          this.title.setTitle(`${this.recipe.name} - Recipe Scaler`);
        }
      } catch {
        console.error('Could not parse recipe from route param, using default.');
      }

      if (!this._recipe) {
        this.navigateToRecipe(RecipeComponent.defaultRecipe);
      }
    });
  }

  updateScaledValues(ingredient: RecipeIngredientViewModel): void {
    const scaling = ingredient.scaledMeasure / ingredient.measure;
    for (const e of this.recipeViewModel.ingredients) {
      if (e === ingredient) { continue; }
      e.scaledMeasure = scaling * e.measure;
    }
    if (this.recipeViewModel.recipeNumberOfServes > 0) {
      this.recipeViewModel.desiredNumberOfServes = this.recipeViewModel.recipeNumberOfServes * scaling;
    }
  }

  updateServes(newServes: number): void {
    const scaling = newServes / this.recipeViewModel.recipeNumberOfServes;
    for (const e of this.recipeViewModel.ingredients) {
      e.scaledMeasure = scaling * e.measure;
    }
  }

  getRecipeUrl(): string {
    return window.location.origin + window.location.pathname;
  }

  editRecipe(): void {
    this.editMode = true;
  }

  saveRecipe(): void {
    this.editMode = false;
    try {
      if (this.recipeJson && this.recipeJson.length > 0) {
        const newRecipe: Recipe = JSON.parse(this.recipeJson);
        this.navigateToRecipe(newRecipe);
      }
    } catch (ex) {
      console.error(ex);
      window.alert('Error in Recipe JSON.');
    }
  }

  navigateToRecipe(recipe: Recipe): void {
    this.router.navigate(['/r', RecipeComponent.encodeRecipe(recipe)]);
  }

  static encodeRecipe(recipe: Recipe): string {
    return btoa(JSON.stringify(recipe));
  }

  static decodeRecipe(encodedRecipe: string): Recipe {
    return JSON.parse(atob(encodedRecipe));
  }

  static get defaultRecipe(): Recipe {
    const baseIngredient: RecipeIngredient = {
      name: 'Rittenhouse Rye whiskey',
      description: '50% ABV',
      measure: 120,
      unitOfMeasure: 'ml'
    };

    return {
      name: 'Manhattans for two',
      description: '<p>Shake with ice and serve in a chilled coupe glass.</p><p>From Liquid Intelligence by Dave Arnold</p>',
      baseIngredient,
      additionalIngredients: [
        {
          name: 'Carpano Antica Formula vermouth',
          description: '16.5% ABV',
          measure: 53,
          unitOfMeasure: 'ml'
        },
        {
          name: 'Angostura bitters',
          measure: 4,
          unitOfMeasure: 'dashes'
        },
        {
          name: 'Brandied cherries or orange twists',
          measure: 2,
          unitOfMeasure: ''
        }
      ],
      numberOfServes: 2
    };
  }
}
