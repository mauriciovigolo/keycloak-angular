/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

/**
 * Represents a feature from keycloak-angular that can be configured during the library initialization.
 *
 * This type defines the structure of a feature that includes a `configure` method,
 * which is responsible for setting up or initializing the feature's behavior or properties
 * related to Keycloak.
 *
 * ### Usage:
 * The `KeycloakFeature` type is typically used for defining modular, reusable Keycloak
 * features that can be dynamically configured and integrated into an application.
 *
 * @property {() => void} configure - A method that initializes or configures the feature.
 * This method is invoked to perform any setup or customization required for the feature.
 *
 * ### Example:
 * ```typescript
 * const withLoggingFeature: KeycloakFeature = {
 *   configure: () => {
 *     console.log('Configuring Keycloak logging feature');
 *   },
 * };
 *
 * const withAnalyticsFeature: KeycloakFeature = {
 *   configure: () => {
 *     console.log('Configuring Keycloak analytics feature');
 *   },
 * };
 *
 * // Configure and initialize features
 * withLoggingFeature.configure();
 * withAnalyticsFeature.configure();
 * ```
 */
export type KeycloakFeature = {
  configure: () => void;
};
