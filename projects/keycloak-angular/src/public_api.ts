/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

/**
 * @deprecated Use Keycloak's internal types instead.
 */
export type KeycloakConfig = Keycloak.KeycloakConfig;
export {
  KeycloakEvent,
  KeycloakEventType
} from './lib/core/interfaces/keycloak-event';
/**
 * @deprecated Use Keycloak's internal types instead.
 */
export type KeycloakInitOptions = Keycloak.KeycloakInitOptions;
export { KeycloakOptions } from './lib/core/interfaces/keycloak-options';
export { KeycloakAuthGuard } from './lib/core/services/keycloak-auth-guard';
export { KeycloakService } from './lib/core/services/keycloak.service';
export {
  KeycloakBearerInterceptor
} from './lib/core/interceptors/keycloak-bearer.interceptor';
export { CoreModule } from './lib/core/core.module';
export { KeycloakAngularModule } from './lib/keycloak-angular.module';
