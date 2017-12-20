import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from 'clarity-angular';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import {
  AppComponent,
  HeroesComponent,
  HomeComponent,
  LoginComponent,
  HeroDetailsComponent
} from './components';
import { HeroesService } from './services';
import { AppRoutingModule } from './app-routing.module';
import { initializer } from './utils/app-init';

@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent,
    HomeComponent,
    LoginComponent,
    HeroDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ClarityModule.forRoot(),
    KeycloakAngularModule,
    AppRoutingModule
  ],
  providers: [
    HeroesService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
