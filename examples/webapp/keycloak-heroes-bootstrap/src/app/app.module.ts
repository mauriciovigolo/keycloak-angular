import { BrowserModule } from '@angular/platform-browser';
import { NgModule, DoBootstrap } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from '@clr/angular';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent, HeroesComponent, HomeComponent } from './components';
import { HeroesService } from './services';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

let keycloakService: KeycloakService = new KeycloakService();

@NgModule({
  declarations: [AppComponent, HeroesComponent, HomeComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ClarityModule,
    KeycloakAngularModule,
    AppRoutingModule
  ],
  providers: [
    HeroesService,
    {
      provide: KeycloakService,
      useValue: keycloakService
    }
  ],
  entryComponents: [AppComponent]
})
export class AppModule implements DoBootstrap {
  async ngDoBootstrap(app) {
    const { keycloakConfig } = environment;

    try {
      await keycloakService.init({ config: keycloakConfig });
      app.bootstrap(AppComponent);
    } catch (error) {
      console.error('Keycloak init failed', error);
    }
  }
}
