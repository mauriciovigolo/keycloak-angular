import { KeycloakInitOptions } from 'keycloak-js';

import { KeycloakConfig } from './keycloak-config';

export interface KeycloakOptions {
  config: KeycloakConfig;
  initOptions: KeycloakInitOptions;
}