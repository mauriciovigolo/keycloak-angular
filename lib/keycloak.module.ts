/**
* @license
* Copyright Mauricio Gemelli Vigolo. All Rights Reserved.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import { NgModule } from '@angular/core';
import { KeycloakAngularService } from './services';

@NgModule({
  providers: [KeycloakAngularService]
})
export class KeycloakModule {}
