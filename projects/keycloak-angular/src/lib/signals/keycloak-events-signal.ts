/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import Keycloak, { KeycloakError } from 'keycloak-js';
import { signal, Signal, InjectionToken } from '@angular/core';

/**
 * Keycloak event types, as described at the keycloak-js documentation:
 * https://www.keycloak.org/docs/latest/securing_apps/index.html#callback-events
 */
export enum KeycloakEventType {
  /**
   * Keycloak Angular is not initialized yet. This is the initial state applied to the Keycloak Event Signal.
   * Note: This event is only emitted in Keycloak Angular, it is not part of the keycloak-js.
   */
  KeycloakAngularNotInitialized = 'KeycloakAngularNotInitialized',
  /**
   * Keycloak Angular is in the process of initializing the providers and Keycloak Instance.
   * Note: This event is only emitted in Keycloak Angular, it is not part of the keycloak-js.
   */
  KeycloakAngularInit = 'KeycloakAngularInit',
  /**
   * Triggered if there is an error during authentication.
   */
  AuthError = 'AuthError',
  /**
   * Triggered when the user logs out. This event will only be triggered
   * if the session status iframe is enabled or in Cordova mode.
   */
  AuthLogout = 'AuthLogout',
  /**
   * Triggered if an error occurs while attempting to refresh the token.
   */
  AuthRefreshError = 'AuthRefreshError',
  /**
   * Triggered when the token is successfully refreshed.
   */
  AuthRefreshSuccess = 'AuthRefreshSuccess',
  /**
   * Triggered when a user is successfully authenticated.
   */
  AuthSuccess = 'AuthSuccess',
  /**
   * Triggered when the Keycloak adapter has completed initialization.
   */
  Ready = 'Ready',
  /**
   * Triggered when the access token expires. Depending on the flow, you may
   * need to use `updateToken` to refresh the token or redirect the user
   * to the login screen.
   */
  TokenExpired = 'TokenExpired',
  /**
   * Triggered when an authentication action is requested by the application.
   */
  ActionUpdate = 'ActionUpdate'
}

/**
 * Arguments for the `Ready` event, representing the authentication state.
 */
export type ReadyArgs = boolean;

/**
 * Arguments for the `ActionUpdate` event, providing information about the status
 * and optional details about the action.
 */
export type ActionUpdateArgs = {
  /**
   * Status of the action, indicating whether it was successful, encountered an error,
   * or was cancelled.
   */
  status: 'success' | 'error' | 'cancelled';
  /**
   * Optional name or identifier of the action performed.
   */
  action?: string;
};

/**
 * Arguments for the `AuthError` event, providing detailed error information.
 */
export type AuthErrorArgs = KeycloakError;

type EventArgs = ReadyArgs | ActionUpdateArgs | AuthErrorArgs;

/**
 * Helper function to typecast unknown arguments into a specific Keycloak event type.
 *
 * @template T - The expected argument type.
 * @param args - The arguments to be cast.
 * @returns The arguments typed as `T`.
 */
export const typeEventArgs = <T extends EventArgs>(args: unknown): T => args as T;

/**
 * Structure of a Keycloak event, including its type and optional arguments.
 */
export interface KeycloakEvent {
  /**
   * Event type as described at {@link KeycloakEventType}.
   */
  type: KeycloakEventType;
  /**
   * Arguments from the keycloak-js event function.
   */
  args?: unknown;
}

/**
 * Creates a signal to manage Keycloak events, initializing the signal with
 * appropriate default values or values from a given Keycloak instance.
 *
 * @param keycloak - An instance of the Keycloak client.
 * @returns A `Signal` that tracks the current Keycloak event state.
 */
export const createKeycloakSignal = (keycloak?: Keycloak) => {
  const keycloakSignal = signal<KeycloakEvent>({
    type: KeycloakEventType.KeycloakAngularInit
  });

  if (!keycloak) {
    keycloakSignal.set({
      type: KeycloakEventType.KeycloakAngularNotInitialized
    });

    return keycloakSignal;
  }

  keycloak.onReady = (authenticated) => {
    keycloakSignal.set({
      type: KeycloakEventType.Ready,
      args: authenticated
    });
  };

  keycloak.onAuthError = (errorData) => {
    keycloakSignal.set({
      type: KeycloakEventType.AuthError,
      args: errorData
    });
  };

  keycloak.onAuthLogout = () => {
    keycloakSignal.set({
      type: KeycloakEventType.AuthLogout
    });
  };

  keycloak.onActionUpdate = (status, action) => {
    keycloakSignal.set({
      type: KeycloakEventType.ActionUpdate,
      args: { status, action }
    });
  };

  keycloak.onAuthRefreshError = () => {
    keycloakSignal.set({
      type: KeycloakEventType.AuthRefreshError
    });
  };

  keycloak.onAuthRefreshSuccess = () => {
    keycloakSignal.set({
      type: KeycloakEventType.AuthRefreshSuccess
    });
  };

  keycloak.onAuthSuccess = () => {
    keycloakSignal.set({
      type: KeycloakEventType.AuthSuccess
    });
  };

  keycloak.onTokenExpired = () => {
    keycloakSignal.set({
      type: KeycloakEventType.TokenExpired
    });
  };

  return keycloakSignal;
};

/**
 * Injection token for the Keycloak events signal, used for dependency injection.
 */
export const KEYCLOAK_EVENT_SIGNAL = new InjectionToken<Signal<KeycloakEvent>>('Keycloak Events Signal');
