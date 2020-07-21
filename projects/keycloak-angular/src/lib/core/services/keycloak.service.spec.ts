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

  it('should be created', inject(
    [KeycloakService],
    (service: KeycloakService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('#loadExcludedUrls', () => {
    it('should create the ExcludedUrlRegex objects if the bearerExcludedUrls arg is a string array', inject(
      [KeycloakService],
      (service: KeycloakService) => {
        const loadExcludedUrls = service['loadExcludedUrls'];
        const result = loadExcludedUrls(['home', 'public']);
        const { urlPattern, httpMethods } = result[0];

        expect(result.length).toBe(2);
        expect(urlPattern).toBeDefined();
        expect(urlPattern.test('http://url/home')).toBeTruthy();
        expect(httpMethods.length).toBe(0);
      }
    ));

    it('should create the ExcludedUrlRegex objects if the bearerExcludedUrls arg is an mixed array of strings and ExcludedUrl objects',
      inject([KeycloakService], (service: KeycloakService) => {
        const loadExcludedUrls = service['loadExcludedUrls'];
        const result = loadExcludedUrls([
          'home',
          { url: 'public', httpMethods: ['GET'] }
        ]);
        expect(result.length).toBe(2);

        const excludedRegex1 = result[0];
        expect(excludedRegex1.urlPattern).toBeDefined();
        expect(excludedRegex1.urlPattern.test('https://url/home')).toBeTruthy();
        expect(excludedRegex1.httpMethods.length).toBe(0);

        const excludedRegex2 = result[1];
        expect(excludedRegex2.urlPattern).toBeDefined();
        expect(
          excludedRegex2.urlPattern.test('https://url/public')
        ).toBeTruthy();
        expect(excludedRegex2.httpMethods.length).toBe(1);
        expect(excludedRegex2.httpMethods[0]).toBe('GET');
      }
    ));

    it('should return the token getToken is called', inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        service.updateToken = async () => Promise.resolve(true);
        (service['_instance'] as any) = {
          token: 'testToken'
        };

        const token = await service.getToken();

        expect(token).toEqual('testToken');
      }
    ));
  });
});
