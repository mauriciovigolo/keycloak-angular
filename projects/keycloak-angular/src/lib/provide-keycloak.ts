/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import Keycloak, { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';
import { EnvironmentProviders, makeEnvironmentProviders, provideAppInitializer, Provider } from '@angular/core';
import { createKeycloakSignal, KEYCLOAK_EVENT_SIGNAL } from './signals/keycloak-events-signal';
import { KeycloakFeature } from './features/keycloak.feature';

/**
 * Options for configuring Keycloak and additional providers.
 */
export type ProvideKeycloakOptions = {
  /**
   * Keycloak configuration, including the server URL, realm, and client ID.
   */
  config: KeycloakConfig;

  /**
   * Optional initialization options for the Keycloak instance.
   * If not provided, Keycloak will not initialize automatically.
   */
  initOptions?: KeycloakInitOptions;

  /**
   * Optional array of additional Angular providers or environment providers.
   */
  providers?: Array<Provider | EnvironmentProviders>;

  /**
   * Optional array of Keycloak features to extend the functionality of the Keycloak integration.
   */
  features?: Array<KeycloakFeature>;
};

/**
 * Provides Keycloak initialization logic for the app initializer phase.
 * Ensures Keycloak is initialized and features are configured.
 *
 * @param keycloak - The Keycloak instance.
 * @param options - ProvideKeycloakOptions for configuration.
 * @returns EnvironmentProviders or an empty array if `initOptions` is not provided.
 */
const provideKeycloakInAppInitializer = (
  keycloak: Keycloak,
  options: ProvideKeycloakOptions
): EnvironmentProviders | Provider[] => {
  const { initOptions, features = [] } = options;

  if (!initOptions) {
    return [];
  }

  return provideAppInitializer(() => {
    keycloak.init(initOptions).catch((error) => {
      console.error('Keycloak initialization failed', error);
      return Promise.reject(error);
    });
    features.forEach((feature) => feature.configure());
  });
};

/**
 * Configures and provides Keycloak as a dependency in an Angular application.
 *
 * This function initializes a Keycloak instance with the provided configuration and
 * optional initialization options. It integrates Keycloak into Angular dependency
 * injection system, allowing easy consumption throughout the application. Additionally,
 * it supports custom providers and Keycloak Angular features.
 *
 * If `initOptions` is not provided, the Keycloak instance will not be automatically initialized.
 * In such cases, the application must call `keycloak.init()` explicitly.
 *
 * @param options - Configuration object for Keycloak:
 *   - `config`: The Keycloak configuration, including the server URL, realm, and client ID.
 *   - `initOptions` (Optional): Initialization options for the Keycloak instance.
 *   - `providers` (Optional): Additional Angular providers to include.
 *   - `features` (Optional): Keycloak Angular features to configure during initialization.
 *
 * @returns An `EnvironmentProviders` object integrating Keycloak setup and additional providers.
 *
 * @example
 * ```ts
 * import { provideKeycloak } from './keycloak.providers';
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { AppComponent } from './app/app.component';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideKeycloak({
 *       config: {
 *         url: 'https://auth-server.example.com',
 *         realm: 'my-realm',
 *         clientId: 'my-client',
 *       },
 *       initOptions: {
 *         onLoad: 'login-required',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export function provideKeycloak(options: ProvideKeycloakOptions): EnvironmentProviders {
  const keycloak = new Keycloak(options.config);

  const providers = options.providers ?? [];
  const keycloakSignal = createKeycloakSignal(keycloak);

  return makeEnvironmentProviders([
    {
      provide: KEYCLOAK_EVENT_SIGNAL,
      useValue: keycloakSignal
    },
    {
      provide: Keycloak,
      useValue: keycloak
    },
    ...providers,
    provideKeycloakInAppInitializer(keycloak, options)
  ]);
}
