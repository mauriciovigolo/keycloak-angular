/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import { NgModule } from '@angular/core';
import { KeycloakService } from './services';
import { KeycloakBearerInterceptor } from './interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/**
 * The Keycloak Angular Module.
 *
 * Provides the KeycloakService and the bearer interceptor.
 */
@NgModule({
  providers: [
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
  ]
})
export class KeycloakAngularModule {}
