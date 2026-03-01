import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';

import { RecipeComponent } from './recipe';

describe('RecipeComponent', () => {
  async function setup(params: unknown = { base64recipe: RecipeComponent.encodeRecipe(RecipeComponent.defaultRecipe) }) {
    const navigateCalls: unknown[] = [];
    const titleCalls: string[] = [];

    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of(params),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: (value: unknown) => {
              navigateCalls.push(value);
              return Promise.resolve(true);
            },
          },
        },
        {
          provide: Title,
          useValue: {
            setTitle: (value: string) => {
              titleCalls.push(value);
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RecipeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, navigateCalls, titleCalls };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should parse recipe from route', async () => {
    const { component, titleCalls } = await setup();
    expect(component.recipeViewModel.name).toBe('Manhattans for two');
    expect(titleCalls.at(-1)).toContain('Manhattans for two - Recipe Scaler');
  });

  it('should navigate to default recipe when route param is missing', async () => {
    const { navigateCalls } = await setup({});
    expect(navigateCalls.length).toBe(1);
    const routeArgs = navigateCalls[0] as string[];
    expect(routeArgs[0]).toBe('/r');
    expect(typeof routeArgs[1]).toBe('string');
    expect(routeArgs[1].length).toBeGreaterThan(0);
  });

  it('should navigate to default recipe when route param is invalid base64', async () => {
    const { navigateCalls } = await setup({ base64recipe: '***invalid***' });
    expect(navigateCalls.length).toBe(1);
  });

  it('should update scaled ingredient values and serves value', async () => {
    const { component } = await setup();
    const first = component.recipeViewModel.ingredients[0];
    const second = component.recipeViewModel.ingredients[1];

    first.scaledMeasure = first.measure * 2;
    component.updateScaledValues(first);

    expect(second.scaledMeasure).toBe(second.measure * 2);
    expect(component.recipeViewModel.desiredNumberOfServes).toBe(4);
  });

  it('should scale all ingredients when serves changes', async () => {
    const { component } = await setup();
    component.updateServes(1);
    expect(component.recipeViewModel.ingredients[0].scaledMeasure).toBe(60);
    expect(component.recipeViewModel.ingredients[1].scaledMeasure).toBe(26.5);
  });

  it('should enter edit mode and save valid recipe json', async () => {
    const { component, navigateCalls } = await setup();
    component.editRecipe(component.recipe);
    expect(component.editMode).toBe(true);

    component.recipeJson = JSON.stringify({
      ...RecipeComponent.defaultRecipe,
      name: 'Custom Manhattan',
    });
    component.saveRecipe();

    expect(component.editMode).toBe(false);
    expect(navigateCalls.length).toBe(1);
    const routeArgs = navigateCalls[0] as string[];
    expect(routeArgs[0]).toBe('/r');
  });

  it('should alert on invalid recipe json when saving', async () => {
    const originalAlert = window.alert;
    let alertMessage = '';
    window.alert = (message?: string) => {
      alertMessage = String(message ?? '');
    };

    try {
      const { component, navigateCalls } = await setup();
      component.editMode = true;
      component.recipeJson = '{';
      component.saveRecipe();

      expect(component.editMode).toBe(false);
      expect(alertMessage).toContain('Error in Recipe JSON.');
      expect(navigateCalls.length).toBe(0);
    } finally {
      window.alert = originalAlert;
    }
  });

  it('should encode and decode recipe payload', () => {
    const encoded = RecipeComponent.encodeRecipe(RecipeComponent.defaultRecipe);
    const decoded = RecipeComponent.decodeRecipe(encoded);
    expect(decoded.name).toBe('Manhattans for two');
    expect(decoded.additionalIngredients.length).toBe(3);
  });

  it('should encode recipe payload as URL-safe base64', () => {
    const encoded = RecipeComponent.encodeRecipe(RecipeComponent.defaultRecipe);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('should decode legacy base64 payloads for backward compatibility', () => {
    const legacyEncoded = btoa(JSON.stringify(RecipeComponent.defaultRecipe));
    const decoded = RecipeComponent.decodeRecipe(legacyEncoded);
    expect(decoded.name).toBe('Manhattans for two');
  });

  it('should decode URI-encoded payload strings', () => {
    const encoded = RecipeComponent.encodeRecipe(RecipeComponent.defaultRecipe);
    const uriEncoded = encodeURIComponent(encoded);
    const decoded = RecipeComponent.decodeRecipe(uriEncoded);
    expect(decoded.name).toBe('Manhattans for two');
  });

  it('should generate URL for current location', async () => {
    const { component } = await setup();
    const url = component.generateUrlForRecipe(component.recipe);
    expect(url).toContain(window.location.origin);
  });
});
