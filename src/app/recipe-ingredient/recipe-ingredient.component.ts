import { Component, OnInit, Input } from '@angular/core';

import { RecipeIngredientViewModel } from '../viewmodels/recipe-ingredient-view-model';

@Component({
  selector: 'app-recipe-ingredient',
  templateUrl: './recipe-ingredient.component.html',
  styleUrls: ['./recipe-ingredient.component.css']
})
export class RecipeIngredientComponent implements OnInit {

  @Input()
  ingredient: RecipeIngredientViewModel;

  constructor() { }

  ngOnInit() {
  }

}
