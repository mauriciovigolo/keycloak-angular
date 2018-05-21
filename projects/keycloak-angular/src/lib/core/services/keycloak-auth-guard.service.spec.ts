/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import { TestBed, inject } from '@angular/core/testing';

import { KeycloakAuthGuardService } from './keycloak-auth-guard.service';

describe('KeycloakAuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakAuthGuardService]
    });
  });

  it(
    'should be created',
    inject([KeycloakAuthGuardService], (service: KeycloakAuthGuardService) => {
      expect(service).toBeTruthy();
    })
  );
});
