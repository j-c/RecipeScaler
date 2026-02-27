import { CommonModule, PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Recipe } from '../models/recipe';
import { MeasuredRecipeIngredient } from '../models/measured-recipe-ingredient';
import { RecipeViewModel } from '../viewmodels/recipe-view-model';
import { RecipeIngredientViewModel } from '../viewmodels/recipe-ingredient-view-model';

@Component({
  selector: 'app-recipe',
  imports: [
    CommonModule,
    FormsModule,
    PercentPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './recipe.html',
  styleUrl: './recipe.css',
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
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      try {
        const base64Recipe = params['base64recipe'] as string;
        if (base64Recipe && base64Recipe.length > 0) {
          const parsedRecipe = RecipeComponent.decodeRecipe(base64Recipe);
          this.recipe = parsedRecipe;
          this.title.setTitle(`${this.recipe.name} - Recipe Scaler`);
        }
      } catch {
      }

      if (!this.recipe) {
        this.navigateToRecipe(RecipeComponent.defaultRecipe);
      }
    });
  }

  updateScaledValues(ingredient: RecipeIngredientViewModel): void {
    const scaling = ingredient.scaledMeasure / ingredient.measure;
    this.recipeViewModel.ingredients.forEach((entry) => {
      if (entry === ingredient) {
        return;
      }
      entry.scaledMeasure = scaling * entry.measure;
    });

    if (this.recipeViewModel.recipeNumberOfServes && this.recipeViewModel.recipeNumberOfServes > 0) {
      this.recipeViewModel.desiredNumberOfServes = this.recipeViewModel.recipeNumberOfServes * scaling;
    }
  }

  updateServes(newServes: number): void {
    const scaling = newServes / (this.recipeViewModel.recipeNumberOfServes || 1);
    this.recipeViewModel.ingredients.forEach((entry) => {
      entry.scaledMeasure = scaling * entry.measure;
    });
  }

  generateUrlForRecipe(_recipe: Recipe): string {
    return window.location.origin + window.location.pathname;
  }

  editRecipe(_recipe: Recipe): void {
    this.editMode = true;
  }

  saveRecipe(): void {
    this.editMode = false;
    try {
      if (this.recipeJson && this.recipeJson.length > 0) {
        const newRecipe: Recipe = JSON.parse(this.recipeJson);
        this.navigateToRecipe(newRecipe);
      }
    } catch {
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
    const baseIngredient: MeasuredRecipeIngredient = {
      name: 'Rittenhouse Rye whiskey',
      description: '50% ABV',
      measure: 120,
      unitOfMeasure: 'ml',
    };

    const additionalIngredients = [];
    additionalIngredients.push({
      name: 'Carpano Antica Formula vermouth',
      description: '16.5% ABV',
      measure: 53,
      unitOfMeasure: 'ml',
    });
    additionalIngredients.push({
      name: 'Angostura bitters',
      measure: 4,
      unitOfMeasure: 'dashes',
    });
    additionalIngredients.push({
      name: 'Brandied cherries or orange twists',
      measure: 2,
      unitOfMeasure: '',
    });

    const defaultRecipe: Recipe = {
      name: 'Manhattans for two',
      description: '<p>Shake with ice and serve in a chilled coupe glass.</p><p>From Liquid Intelligence by Dave Arnold</p>',
      baseIngredient,
      additionalIngredients,
      numberOfServes: 2,
    };

    return defaultRecipe;
  }
}
