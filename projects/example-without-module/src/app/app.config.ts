import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';
import {
  KeycloakService,
  keycloakBearerFnInterceptor,
  provideKeycloakConfigFactory
} from 'keycloak-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideKeycloakConfigFactory(
      (keycloakService: KeycloakService) => {
        return () =>
          keycloakService.init({
            config: {
              url: 'http://localhost:8080',
              realm: 'bigpods',
              clientId: 'bigpods-admin-browser'
            },
            initOptions: {
              onLoad: 'login-required',
              flow: 'standard',
              silentCheckSsoRedirectUri:
                window.location.origin + '/assets/silent-check-sso.html'
            },
            loadUserProfileAtStartUp: true,
            bearerExcludedUrls: ['/assets']
          });
      },
      [KeycloakService]
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([keycloakBearerFnInterceptor])
    )
  ]
};
