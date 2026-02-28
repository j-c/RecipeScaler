import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RecipeComponent } from './recipe.component';

describe('RecipeComponent', () => {
  let component: RecipeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should encode and decode a recipe', () => {
    const recipe = RecipeComponent.defaultRecipe;
    const encoded = RecipeComponent.encodeRecipe(recipe);
    const decoded = RecipeComponent.decodeRecipe(encoded);
    expect(decoded.name).toBe(recipe.name);
    expect(decoded.baseIngredient.measure).toBe(recipe.baseIngredient.measure);
    expect(decoded.additionalIngredients.length).toBe(recipe.additionalIngredients.length);
  });

  it('should have a default recipe with valid structure', () => {
    const recipe = RecipeComponent.defaultRecipe;
    expect(recipe.name).toBeTruthy();
    expect(recipe.baseIngredient).toBeTruthy();
    expect(recipe.baseIngredient.measure).toBeGreaterThan(0);
    expect(recipe.additionalIngredients.length).toBeGreaterThan(0);
  });
});
