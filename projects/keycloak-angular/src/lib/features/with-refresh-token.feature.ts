/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { inject } from '@angular/core';

import { AutoRefreshTokenService } from '../services/auto-refresh-token.service';
import { KeycloakFeature } from './keycloak.feature';

/**
 * Options for configuring the auto-refresh token feature.
 *
 * This type defines the configuration parameters for enabling auto-refresh
 * of Keycloak tokens and handling session inactivity scenarios.
 */
type WithRefreshTokenOptions = {
  /**
   * The session timeout duration in milliseconds. This specifies the time
   * of inactivity after which the session is considered expired.
   *
   * Default value: `300000` milliseconds (5 minutes).
   */
  sessionTimeout?: number;

  /**
   * Action to take when the session timeout due to inactivity occurs.
   *
   * - `'login'`: Execute the `keycloak.login` method.
   * - `'logout'`: Logs the user out by calling the `keycloak.logout` method.
   * - `'none'`: Takes no action on session timeout.
   *
   * Default value: `'logout'`.
   */
  onInactivityTimeout?: 'login' | 'logout' | 'none';
};

/**
 * Enables automatic token refresh and session inactivity handling for a
 * Keycloak-enabled Angular application.
 *
 * This function initializes a service that tracks user interactions, such as
 * mouse movements, touches, key presses, clicks, and scrolls. If user activity
 * is detected, it periodically calls `Keycloak.updateToken` to ensure the bearer
 * token remains valid and does not expire.
 *
 * If the session remains inactive beyond the defined `sessionTimeout`, the
 * specified action (`logout`, `login`, or `none`) will be executed. By default,
 * the service will call `keycloak.logout` upon inactivity timeout.
 *
 * Event tracking uses RxJS observables with a debounce of 300 milliseconds to
 * monitor user interactions. When the Keycloak `OnTokenExpired` event occurs,
 * the service checks the user's last activity timestamp. If the user has been
 * active within the session timeout period, it refreshes the token using `updateToken`.
 *
 *
 * @param options - Configuration options for the auto-refresh token feature.
 *   - `sessionTimeout` (optional): The duration in milliseconds after which
 *     the session is considered inactive. Defaults to `300000` (5 minutes).
 *   - `onInactivityTimeout` (optional): The action to take when session inactivity
 *     exceeds the specified timeout. Defaults to `'logout'`.
 *       - `'login'`: Execute `keycloak.login` function.
 *       - `'logout'`: Logs the user out by calling `keycloak.logout`.
 *       - `'none'`: No action is taken.
 *
 * @returns A `KeycloakFeature` instance that configures and enables the
 * auto-refresh token functionality.
 */
export function withAutoRefreshToken(options?: WithRefreshTokenOptions): KeycloakFeature {
  return {
    configure: () => {
      const autoRefreshTokenService = inject(AutoRefreshTokenService);
      autoRefreshTokenService.start(options);
    }
  };
}
