import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from 'clarity-angular';
import { KeycloakAngularModule } from 'keycloak-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeroesComponent, PlayersComponent, TeamsComponent } from './components';
import { HeroesService } from './services';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';


@NgModule({
  declarations: [AppComponent, HeroesComponent, PlayersComponent, TeamsComponent, HomeComponent, LoginComponent ],
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
