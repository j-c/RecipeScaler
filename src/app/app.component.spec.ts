import { describe, it, expect } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should have title "app works!"', () => {
    const app = new AppComponent();
    expect(app.title).toEqual('app works!');
  });
});
