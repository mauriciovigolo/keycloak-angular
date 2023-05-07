/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
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

  describe('#transformToUrlRegexes', () => {
    it('should create the UrlRegex objects if the bearerExcludedUrls arg is a string array', inject(
      [KeycloakService],
      (service: KeycloakService) => {
        const transformToUrlRegexes = service['transformToUrlRegexes'];
        const result = transformToUrlRegexes(['home', 'public']);
        const { urlPattern, httpMethods } = result[0];

        expect(result.length).toBe(2);
        expect(urlPattern).toBeDefined();
        expect(urlPattern.test('http://url/home')).toBeTruthy();
        expect(urlPattern.test('http://home/url')).toBeTruthy();
        expect(urlPattern.test('/home')).toBeTruthy();
        expect(urlPattern.test('/hotel')).toBeFalse();

        expect(httpMethods).toBe(undefined);
      }
    ));

    it('should create the UrlRegex objects if the bearerExcludedUrls arg is an mixed array of strings and UrlAndHttpMethods objects', inject(
      [KeycloakService],
      (service: KeycloakService) => {
        const transformToUrlRegexes = service['transformToUrlRegexes'];
        const result = transformToUrlRegexes([
          'home',
          { url: 'public', httpMethods: ['GET'] }
        ]);
        expect(result.length).toBe(2);

        const excludedRegex1 = result[0];
        expect(excludedRegex1.urlPattern).toBeDefined();
        expect(excludedRegex1.urlPattern.test('https://url/home')).toBeTruthy();
        expect(excludedRegex1.httpMethods).toBe(undefined);

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
        service.updateToken = () => Promise.resolve(true);
        (service['_instance'] as any) = {
          token: 'testToken'
        };

        const token = await service.getToken();

        expect(token).toEqual('testToken');
      }
    ));

    it('should throw error if updateToken is called before initialization', inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        await expectAsync(service.updateToken()).toBeRejectedWithError(
          /not initialized/
        );
      }
    ));

    it(`should throw an error if both 'bearerExcludedUrls' and 'bearerIncludedUrls' are set`, inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        await expectAsync(
          service.init({
            bearerIncludedUrls: ['/api'],
            bearerExcludedUrls: ['/hi']
          })
        ).toBeRejectedWithError(
          `'bearerExcludedUrls' and 'bearerIncludedUrls' are both set, aborting initialisation: You can only use one or the other.`
        );
      }
    ));
  });
});
