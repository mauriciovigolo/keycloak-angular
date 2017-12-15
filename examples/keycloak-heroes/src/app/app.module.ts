import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from 'clarity-angular';
import { KeycloakAngularModule } from 'keycloak-angular';

import { AppHeroesModule } from './app-heroes';
import { AppRoutingModule } from './app-routing';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ClarityModule.forRoot(),
    KeycloakAngularModule,
    AppRoutingModule,
    AppHeroesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
