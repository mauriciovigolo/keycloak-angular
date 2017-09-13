import { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakConfig } from './keycloak-config';

export interface KeycloakOptions {
  config?: string | KeycloakConfig;
  initOptions?: KeycloakInitOptions;
}
