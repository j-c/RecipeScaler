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
  routeLoadErrorMessage = '';
  recipeJson = '';
  editMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const base64Recipe = params['base64recipe'] as string | undefined;

      // No payload in the route: use the default recipe URL.
      if (!base64Recipe || base64Recipe.length === 0) {
        this.routeLoadErrorMessage = '';
        this.navigateToRecipe(RecipeComponent.defaultRecipe);
        return;
      }

      try {
        const parsedRecipe = RecipeComponent.decodeRecipe(base64Recipe);
        this.recipe = parsedRecipe;
        this.routeLoadErrorMessage = '';
        this.title.setTitle(`${this.recipe.name} - Recipe Scaler`);
      } catch (error) {
        // Payload is present but invalid/corrupt: recover with default and show a user-facing note.
        console.warn('Could not decode recipe URL payload. Loading default recipe.', error);
        this.routeLoadErrorMessage = 'Could not read this recipe link. Loaded the default recipe instead.';
        this.recipe = RecipeComponent.defaultRecipe;
        this.title.setTitle(`${this.recipe.name} - Recipe Scaler`);
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
    return `${window.location.origin}/r/${RecipeComponent.encodeRecipe(_recipe)}`;
  }

  dismissRouteLoadError(): void {
    this.routeLoadErrorMessage = '';
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
    const base64 = btoa(JSON.stringify(recipe));
    return RecipeComponent.toBase64Url(base64);
  }

  static decodeRecipe(encodedRecipe: string): Recipe {
    const decodedPayload = RecipeComponent.decodeRecipePayload(encodedRecipe);
    return JSON.parse(decodedPayload);
  }

  private static decodeRecipePayload(encodedRecipe: string): string {
    if (!encodedRecipe || encodedRecipe.length === 0) {
      throw new Error('Empty recipe payload');
    }

    const trimmedValue = encodedRecipe.trim();
    const decodedUriValue = RecipeComponent.tryDecodeURIComponent(trimmedValue);
    const candidates = decodedUriValue === trimmedValue ? [trimmedValue] : [decodedUriValue, trimmedValue];

    for (const candidate of candidates) {
      try {
        return atob(RecipeComponent.fromBase64Url(candidate));
      } catch {
      }
    }

    throw new Error('Invalid recipe payload encoding');
  }

  private static toBase64Url(value: string): string {
    return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private static fromBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = base64.length % 4;
    if (remainder === 0) {
      return base64;
    }

    if (remainder === 1) {
      throw new Error('Invalid base64 length');
    }

    return base64.padEnd(base64.length + (4 - remainder), '=');
  }

  private static tryDecodeURIComponent(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
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
      description: '<p>Stir with ice and serve in a chilled coupe glass.</p><p>From Liquid Intelligence by Dave Arnold</p>',
      baseIngredient,
      additionalIngredients,
      numberOfServes: 2,
    };

    return defaultRecipe;
  }
}
