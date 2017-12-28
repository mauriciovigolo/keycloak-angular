/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import { KeycloakInitOptions } from './keycloak-init-options';
import { KeycloakConfig } from './keycloak-config';

export interface KeycloakOptions {
  /**
   *
   */
  config?: string | KeycloakConfig;
  /**
   *
   */
  initOptions?: KeycloakInitOptions;
  /**
   *
   */
  bearerExcludedUrls?: string[];
}
