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
      'Should result in error if there is no keycloak.json file and init parameters.',
      inject([KeycloakAngularService], async (service: KeycloakAngularService) => {
        let result;
        try {
          result = await service.init();
        } catch (err) {
          expect(err).toBeDefined();
        }
        expect(result).toBeUndefined();
      })
    );

    it(
      'Should initialize the Keycloak instance using the config parameters.',
      inject([KeycloakAngularService], async (service: KeycloakAngularService) => {
        let result;
        try {
          result = await service.init({
            config: {
              clientId: '',
              realm: '',
              url: ''
            }
          });
        } catch (err) {
          expect(err).toBeUndefined();
        }
        expect(result).toBeUndefined();
      })
    );
  });
});
