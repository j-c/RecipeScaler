import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';

import { RecipeComponent } from './recipe';

describe('RecipeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ base64recipe: RecipeComponent.encodeRecipe(RecipeComponent.defaultRecipe) }),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true),
          },
        },
        {
          provide: Title,
          useValue: {
            setTitle: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RecipeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should parse recipe from route', () => {
    const fixture = TestBed.createComponent(RecipeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.recipeViewModel.name).toBe('Manhattans for two');
  });
});
