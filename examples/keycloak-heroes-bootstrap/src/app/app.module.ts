import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from '@clr/angular';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent, HeroesComponent, HomeComponent } from './components';
import { HeroesService } from './services';
import { AppRoutingModule } from './app-routing.module';
import { AppAuthGuard } from './app.authguard';

const keycloakService = new KeycloakService();

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
  bootstrap: [AppComponent]
})
export class AppModule {
  ngDoBootstrap(app) {
    keycloakService.init()
      .then(() => {
        console.log('[ngDoBootstrap] bootstrap AppComponent');

        app.bootstrap(AppComponent);
      })
      .catch(error => console.error('[ngDoBootstrap] init Keycloak failed', error));
  }
}
