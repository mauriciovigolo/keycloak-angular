/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { NgModule } from '@angular/core';

import { CoreModule } from './core/core.module';

/**
 * @deprecated NgModules are deprecated in Keycloak Angular and will be removed in future versions.
 * Use the new `provideKeycloak` function to load Keycloak in an Angular application.
 * More info: https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/migration-guides/v19.md
 */
@NgModule({
  imports: [CoreModule]
})
export class KeycloakAngularModule {}
