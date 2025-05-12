/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

/**
 * Keycloak event types, as described at the keycloak-js documentation:
 * https://www.keycloak.org/docs/latest/securing_apps/index.html#callback-events
 *
 * @deprecated Keycloak Event based on the KeycloakService is deprecated and
 * will be removed in future versions.
 * Use the new `KEYCLOAK_EVENT_SIGNAL` injection token to listen for the keycloak
 * events.
 * More info: https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/migration-guides/v19.md
 */
export enum KeycloakEventTypeLegacy {
  /**
   * Called if there was an error during authentication.
   */
  OnAuthError,
  /**
   * Called if the user is logged out
   * (will only be called if the session status iframe is enabled, or in Cordova mode).
   */
  OnAuthLogout,
  /**
   * Called if there was an error while trying to refresh the token.
   */
  OnAuthRefreshError,
  /**
   * Called when the token is refreshed.
   */
  OnAuthRefreshSuccess,
  /**
   * Called when a user is successfully authenticated.
   */
  OnAuthSuccess,
  /**
   * Called when the adapter is initialized.
   */
  OnReady,
  /**
   * Called when the access token is expired. If a refresh token is available the token
   * can be refreshed with updateToken, or in cases where it is not (that is, with implicit flow)
   * you can redirect to login screen to obtain a new access token.
   */
  OnTokenExpired,
  /**
   * Called when a AIA has been requested by the application.
   */
  OnActionUpdate
}

/**
 * Structure of an event triggered by Keycloak, contains it's type
 * and arguments (if any).
 *
 * @deprecated Keycloak Event based on the KeycloakService is deprecated and
 * will be removed in future versions.
 * Use the new `KEYCLOAK_EVENT_SIGNAL` injection token to listen for the keycloak
 * events.
 * More info: https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/migration-guides/v19.md
 */
export interface KeycloakEventLegacy {
  /**
   * Event type as described at {@link KeycloakEventTypeLegacy}.
   */
  type: KeycloakEventTypeLegacy;
  /**
   * Arguments from the keycloak-js event function.
   */
  args?: unknown;
}
