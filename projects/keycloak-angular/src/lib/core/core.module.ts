/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CORE_SERVICES } from './services';

@NgModule({
  imports: [CommonModule],
  providers: [CORE_SERVICES]
})
export class CoreModule {}
