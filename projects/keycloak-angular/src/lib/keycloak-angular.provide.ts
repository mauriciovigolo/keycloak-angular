import { APP_INITIALIZER, FactoryProvider, ValueProvider } from '@angular/core';
import { KeycloakOptions } from './core/interfaces/keycloak-options';

/**
 * @description Keycloak Angular provider for the keycloak configuration
 * @param config Keycloak configuration
 * @returns ValueProvider
 */
export const provideKeycloakConfig = (
  config: KeycloakOptions = {}
): ValueProvider => ({
  provide: APP_INITIALIZER,
  useValue: config,
  multi: true
});

/**
 * @description Keycloak Angular factory provider for the keycloak configuration
 * @param factory Keycloak configuration factory
 * @param deps Dependencies for the factory
 * @returns Provider
 */
export const provideKeycloakConfigFactory = (
  factory: (...args: any[]) => Function,
  deps?: any[]
): FactoryProvider => ({
  provide: APP_INITIALIZER,
  useFactory: factory,
  deps: deps,
  multi: true
});
