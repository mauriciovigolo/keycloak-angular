/**
* @license
* Copyright Mauricio Gemelli Vigolo. All Rights Reserved.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import { KeycloakAngularService } from '../';
import { TestBed, inject, async } from '@angular/core/testing';

describe('KeycloakAngularService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KeycloakAngularService
      ]
    });
  });

  describe('#init', () => {
    it(
      'Should initialize the Keycloak instance using the keycloak.json file',
      inject([KeycloakAngularService], (service: KeycloakAngularService) => {
        expect(service).toBeTruthy();
      })
    );
  });
});
