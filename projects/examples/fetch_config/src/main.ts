import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { includeBearerTokenInterceptor } from 'keycloak-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideKeycloakAngular } from './app/keycloak.config';

const initializeApp = async () => {
  const { config, initOptions } = await fetch('/config.json').then((res) => res?.json());

  const appConfig: ApplicationConfig = {
    providers: [
      provideKeycloakAngular(config, {
        ...initOptions,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        redirectUri: window.location.origin + '/'
      }),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
    ]
  };

  await bootstrapApplication(AppComponent, appConfig);
};

initializeApp().catch((error) => console.error(`Failed to initialize the application. ${error.message || error}`));
