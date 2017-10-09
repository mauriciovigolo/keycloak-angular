/**
* @license
* Copyright Mauricio Gemelli Vigolo. All Rights Reserved.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakConfig } from './keycloak-config';

export interface KeycloakOptions {
  config?: string | KeycloakConfig;
  initOptions?: KeycloakInitOptions;
  bearerExcludedUrls?: string[];
}
