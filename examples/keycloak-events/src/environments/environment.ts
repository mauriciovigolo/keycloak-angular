// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { KeycloakConfig } from 'keycloak-angular';

// Add here your keycloak setup infos
let keycloakConfig: KeycloakConfig = {
<<<<<<< HEAD
  url: 'http://localhost:8080/auth',
  realm: 'master',
  clientId: 'keycloak-events'
=======
  url: 'KEYCLOAK-INSTANCE-URL',
  realm: 'REALM-NAME',
  clientId: 'CLIENT-ID-NAME'
>>>>>>> angular4-5-keycloak3
};

export const environment = {
  production: false,
  apis: { countries: 'https://restcountries.eu/rest/v2/' },
  keycloak: keycloakConfig
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
