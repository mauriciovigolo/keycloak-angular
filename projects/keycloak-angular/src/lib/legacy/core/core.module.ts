/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { KeycloakService } from './services/keycloak.service';
import { KeycloakBearerInterceptor } from './interceptors/keycloak-bearer.interceptor';

/**
 * @deprecated NgModules are deprecated in Keycloak Angular and will be removed in future versions.
 * Use the new `provideKeycloak` function to load Keycloak in an Angular application.
 * More info: https://github.com/mauriciovigolo/keycloak-angular/docs/migration-guides/v19.md
 */
@NgModule({
  imports: [CommonModule],
  providers: [
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {}
