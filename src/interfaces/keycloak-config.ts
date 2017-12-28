/**
 * @license
 * Copyright Mauricio Gemelli Vigolo.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
export interface KeycloakConfig {
  /**
   *
   */
  url: string;
  /**
   *
   */
  realm: string;
  /**
   *
   */
  clientId: string;
  /**
   *
   */
  clientSecret?: string;
  /**
   *
   */
  credentials?: any;
}
