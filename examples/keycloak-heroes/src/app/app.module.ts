import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from 'clarity-angular';
import { KeycloakAngularModule } from 'keycloak-angular';

import {
  AppComponent,
  HeroesComponent,
  HomeComponent,
  LoginComponent,
  HeroDetailsComponent
} from './components';
import { HeroesService } from './services';
import { AppRoutingModule } from './app-routing.module';

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
  providers: [HeroesService],
  bootstrap: [AppComponent]
})
export class AppModule {}
