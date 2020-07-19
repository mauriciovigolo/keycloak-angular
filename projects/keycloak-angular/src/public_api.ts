/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

export {
  KeycloakEvent,
  KeycloakEventType
} from './lib/core/interfaces/keycloak-event';
export { KeycloakOptions } from './lib/core/interfaces/keycloak-options';
export { KeycloakAuthGuard } from './lib/core/services/keycloak-auth-guard';
export { KeycloakService } from './lib/core/services/keycloak.service';
export {
  KeycloakBearerInterceptor
} from './lib/core/interceptors/keycloak-bearer.interceptor';
export { CoreModule } from './lib/core/core.module';
export { KeycloakAngularModule } from './lib/keycloak-angular.module';
