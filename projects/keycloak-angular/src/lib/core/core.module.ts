/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { KeycloakService } from './services/keycloak.service';
import { KeycloakBearerInterceptor } from './interceptors/keycloak-bearer.interceptor';
import { KeycloakRptInterceptor } from './interceptors/keycloak-rpt.interceptor';

@NgModule({
  imports: [CommonModule],
  providers: [
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakRptInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {}
