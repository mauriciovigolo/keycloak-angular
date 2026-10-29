/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { HttpContextToken } from '@angular/common/http';

/** Identifies standard Bearer authentication attached by Keycloak Angular. */
export const KEYCLOAK_TOKEN_ATTACHED = new HttpContextToken<boolean>(() => false);
