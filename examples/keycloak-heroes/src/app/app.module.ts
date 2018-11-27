import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from '@clr/angular';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent, HeroesComponent, HomeComponent } from './components';
import { HeroesService } from './services';
import { AppRoutingModule } from './app-routing.module';
import { AppAuthGuard } from './app.authguard';
import { initializer } from './utils/app-init';

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
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
