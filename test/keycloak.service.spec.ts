/**
* @license
* Copyright Mauricio Gemelli Vigolo. All Rights Reserved.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import 'reflect-metadata';
import 'zone.js';
import { expect } from 'chai';
import { KeycloakAngularService } from '../';

describe('KeycloakAngularService', () => {
  let keycloakAngular: KeycloakAngularService;

  beforeEach(() => {
    keycloakAngular = new KeycloakAngularService();
  });

  describe('#init', () => {
    it('Should initialize the Keycloak instance using the keycloak.json file', async () => {
      let result;
      try {
        result = await keycloakAngular.init();
      } catch (error) {
        expect(error).to.be.not.undefined;
      }
      expect(result).to.be.undefined;
    });
  });
});
