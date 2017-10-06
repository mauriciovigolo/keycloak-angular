/**
* @license
* Copyright Mauricio Gemelli Vigolo. All Rights Reserved.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import { KeycloakService, KeycloakAngularModule } from '../';
import { TestBed, inject, async } from '@angular/core/testing';

describe('KeycloakService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KeycloakService
      ],
      imports: [
        KeycloakAngularModule
      ]
    });
  });

  describe('#init', () => {
    it(
      'Should result in error if there is no keycloak.json file and init parameters.',
      inject([KeycloakService], async (service: KeycloakService) => {
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
      'Should result in error if there is no valid config initialization for keycloak',
      inject([KeycloakService], async (service: KeycloakService) => {
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
          expect(err).toBeDefined();
        }
        expect(result).toBeUndefined();
      })
    );
  });
});
