// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { KeycloakConfig } from 'keycloak-js';

// Add here your keycloak setup infos
const keycloakConfig: KeycloakConfig = {
  url: 'KEYCLOAK-INSTANCE-URL',
  realm: 'REALM-NAME',
  clientId: 'CLIENT-ID-NAME'
};

export const environment = {
  production: false,
  assets: {
    dotaImages: 'https://cdn-keycloak-angular.herokuapp.com/assets/images/dota-heroes/'
  },
  apis: { dota: 'http://localhost:3000' },
  keycloakConfig
};
