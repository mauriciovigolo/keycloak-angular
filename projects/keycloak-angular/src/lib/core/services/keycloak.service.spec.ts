/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { TestBed, inject } from '@angular/core/testing';

import { KeycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakService]
    });
  });

  it('Should be created', inject(
    [KeycloakService],
    (service: KeycloakService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('#loadExcludedUrls', () => {
    it('Should create the ExcludedUrl objects if bearerExcludedUrls is a string array', inject(
      [KeycloakService],
      (service: KeycloakService) => {
        const loadExcludedUrls = service['loadExcludedUrls'];
        const result = loadExcludedUrls(['home', 'public']);
        let { urlPattern, httpMethods } = result[0];

        expect(result.length).toBe(2);
        expect(urlPattern).toBeDefined();
        expect(urlPattern.test('http://url/home')).toBeTruthy();
        expect(httpMethods.length).toBe(0);
      }
    ));
  });
});
