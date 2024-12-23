/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed, inject } from '@angular/core/testing';

import Keycloak from 'keycloak-js';

import { KeycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakService]
    });
  });

  it('should be created', inject([KeycloakService], (service: KeycloakService) => {
    expect(service).toBeTruthy();
  }));

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

    it('should create the ExcludedUrlRegex objects if the bearerExcludedUrls arg is an mixed array of strings and ExcludedUrl objects', inject(
      [KeycloakService],
      (service: KeycloakService) => {
        const loadExcludedUrls = service['loadExcludedUrls'];
        const result = loadExcludedUrls(['home', { url: 'public', httpMethods: ['GET'] }]);
        expect(result.length).toBe(2);

        const excludedRegex1 = result[0];
        expect(excludedRegex1.urlPattern).toBeDefined();
        expect(excludedRegex1.urlPattern.test('https://url/home')).toBeTruthy();
        expect(excludedRegex1.httpMethods.length).toBe(0);

        const excludedRegex2 = result[1];
        expect(excludedRegex2.urlPattern).toBeDefined();
        expect(excludedRegex2.urlPattern.test('https://url/public')).toBeTruthy();
        expect(excludedRegex2.httpMethods.length).toBe(1);
        expect(excludedRegex2.httpMethods[0]).toBe('GET');
      }
    ));

    it('should return the token getToken is called', inject([KeycloakService], async (service: KeycloakService) => {
      service.updateToken = () => Promise.resolve(true);
      (service['_instance'] as Partial<Keycloak>) = {
        token: 'testToken'
      };

      const token = await service.getToken();

      expect(token).toEqual('testToken');
    }));

    it('should throw error if updateToken is called before initialization', inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        await expectAsync(service.updateToken()).toBeRejectedWithError(/not initialized/);
      }
    ));
  });

  describe('#getUserRoles', () => {
    it('should return all resource and realm roles', inject([KeycloakService], async (service: KeycloakService) => {
      (service['_instance'] as Partial<Keycloak>) = {
        resourceAccess: {
          client1: {
            roles: ['client1Role1', 'client1Role2']
          },
          client2: {
            roles: ['client2Role1', 'client2Role2']
          }
        },
        realmAccess: {
          roles: ['realmRole1', 'realmRole2']
        }
      };

      const userRoles = service.getUserRoles();

      expect(userRoles).toEqual(
        jasmine.arrayWithExactContents([
          'client1Role1',
          'client1Role2',
          'client2Role1',
          'client2Role2',
          'realmRole1',
          'realmRole2'
        ])
      );
    }));

    it('should return only resource roles if realmRoles is set to false', inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        (service['_instance'] as Partial<Keycloak>) = {
          resourceAccess: {
            client1: {
              roles: ['client1Role1', 'client1Role2']
            },
            client2: {
              roles: ['client2Role1', 'client2Role2']
            }
          },
          realmAccess: {
            roles: ['realmRole1', 'realmRole2']
          }
        };

        const userRoles = service.getUserRoles(false);

        expect(userRoles).toEqual(
          jasmine.arrayWithExactContents(['client1Role1', 'client1Role2', 'client2Role1', 'client2Role2'])
        );
      }
    ));

    it('should return only resource roles from the given resource if realmRoles is set to false and resource is specified', inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        (service['_instance'] as Partial<Keycloak>) = {
          resourceAccess: {
            client1: {
              roles: ['client1Role1', 'client1Role2']
            },
            client2: {
              roles: ['client2Role1', 'client2Role2']
            }
          },
          realmAccess: {
            roles: ['realmRole1', 'realmRole2']
          }
        };

        const userRoles = service.getUserRoles(false, 'client2');

        expect(userRoles).toEqual(jasmine.arrayWithExactContents(['client2Role1', 'client2Role2']));
      }
    ));

    it('should return only resource roles from the given resource and realm roles if realmRoles is set to true and resource is specified', inject(
      [KeycloakService],
      async (service: KeycloakService) => {
        (service['_instance'] as Partial<Keycloak>) = {
          resourceAccess: {
            client1: {
              roles: ['client1Role1', 'client1Role2']
            },
            client2: {
              roles: ['client2Role1', 'client2Role2']
            }
          },
          realmAccess: {
            roles: ['realmRole1', 'realmRole2']
          }
        };

        const userRoles = service.getUserRoles(true, 'client1');

        expect(userRoles).toEqual(
          jasmine.arrayWithExactContents(['client1Role1', 'client1Role2', 'realmRole1', 'realmRole2'])
        );
      }
    ));
  });
});
