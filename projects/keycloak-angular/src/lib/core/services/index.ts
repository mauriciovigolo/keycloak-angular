/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import { KeycloakService } from './keycloak.service';

export const CORE_SERVICES = [KeycloakService];

export * from './keycloak.service';
export * from './keycloak-auth-guard.service';
