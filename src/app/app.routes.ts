import { Routes } from '@angular/router';
import { RecipeComponent } from './recipe/recipe.component';

export const routes: Routes = [
  { path: 'r/:base64recipe', component: RecipeComponent },
  { path: 'r', component: RecipeComponent },
  { path: '', redirectTo: '/r', pathMatch: 'full' },
];
