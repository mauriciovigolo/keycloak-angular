/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { effect, inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from '../signals/keycloak-events-signal';
import { UserActivityService } from './user-activity.service';

/**
 * Configuration options for the `AutoRefreshTokenService`.
 */
type AutoRefreshTokenOptions = {
  /**
   * Maximum allowed inactivity duration in milliseconds before
   * the session times out. Default is `300000`.
   */
  sessionTimeout?: number;

  /**
   * Action to take when the session times out due to inactivity.
   * Options are:
   * - `'login'`: Redirect to the Keycloak login page.
   * - `'logout'`: Log the user out of the session.
   * - `'none'`: Do nothing.
   * Default is `'logout'`.
   */
  onInactivityTimeout?: 'login' | 'logout' | 'none';
};

/**
 * Service to automatically manage the Keycloak token refresh process
 * based on user activity and token expiration events. This service
 * integrates with Keycloak for session management and interacts with
 * user activity monitoring to determine the appropriate action when
 * the token expires.
 *
 * The service listens to `KeycloakSignal` for token-related events
 * (e.g., `TokenExpired`) and provides configurable options for
 * session timeout and inactivity handling.
 */
@Injectable()
export class AutoRefreshTokenService {
  private options: Required<AutoRefreshTokenOptions> = this.defaultOptions;
  private initialized = false;

  constructor(
    private readonly keycloak: Keycloak,
    private readonly userActivity: UserActivityService
  ) {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

    effect(() => {
      const keycloakEvent = keycloakSignal();

      if (keycloakEvent.type === KeycloakEventType.TokenExpired) {
        this.processTokenExpiredEvent();
      }
    });
  }

  private get defaultOptions(): Required<AutoRefreshTokenOptions> {
    return {
      sessionTimeout: 300000,
      onInactivityTimeout: 'logout'
    };
  }

  private executeOnInactivityTimeout() {
    switch (this.options.onInactivityTimeout) {
      case 'login':
        this.keycloak.login().catch((error) => console.error('Failed to execute the login call', error));
        break;
      case 'logout':
        this.keycloak.logout().catch((error) => console.error('Failed to execute the logout call', error));
        break;
      default:
        break;
    }
  }

  private processTokenExpiredEvent() {
    if (!this.initialized || !this.keycloak.authenticated) {
      return;
    }

    if (this.userActivity.isActive(this.options.sessionTimeout)) {
      this.keycloak.updateToken().catch(() => this.executeOnInactivityTimeout());
    } else {
      this.executeOnInactivityTimeout();
    }
  }

  start(options?: AutoRefreshTokenOptions) {
    this.options = { ...this.defaultOptions, ...options };
    this.initialized = true;
    this.userActivity.startMonitoring();
  }
}
