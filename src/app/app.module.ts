import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes }   from '@angular/router';

import { ShareButtonsModule } from "ng2-sharebuttons"

import { AppComponent } from './app.component';
import { RecipeComponent } from './recipe/recipe.component';

const appRoutes: Routes = [
  { path: 'r/:base64recipe', component: RecipeComponent },
  { path: 'r', component: RecipeComponent },
  { path: '',   redirectTo: '/r', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    RecipeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    ShareButtonsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
