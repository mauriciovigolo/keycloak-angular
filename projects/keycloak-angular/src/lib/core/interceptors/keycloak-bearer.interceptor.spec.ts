/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed, inject } from '@angular/core/testing';

import { KeycloakBearerInterceptor } from './keycloak-bearer.interceptor';
import { KeycloakService } from '../services/keycloak.service';
import { firstValueFrom, of } from 'rxjs';
import { HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';

describe('KeycloakBearerInterceptor', () => {
  let keycloak: KeycloakService;

  beforeEach(() => {
    keycloak = new KeycloakService();
    keycloak.shouldAddToken = () => true;
    keycloak.shouldUpdateToken = () => true;

    TestBed.configureTestingModule({
      providers: [
        KeycloakBearerInterceptor,
        {
          provide: KeycloakService,
          useValue: keycloak
        }
      ]
    });

    spyOnProperty(keycloak, 'enableBearerInterceptor').and.returnValue(true);
    spyOnProperty(keycloak, 'excludedUrls').and.returnValue([]);
    spyOn(keycloak, 'updateToken').and.returnValue(firstValueFrom(of(true)));
    spyOn(keycloak, 'isLoggedIn').and.returnValue(firstValueFrom(of(true)));
  });

  it('should be created', inject(
    [KeycloakBearerInterceptor],
    (service: KeycloakBearerInterceptor) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should add token to request and call to update the keycloak token', inject(
    [KeycloakBearerInterceptor],
    async (service: KeycloakBearerInterceptor) => {
      const request = new HttpRequest<unknown>('GET', 'test', {
        headers: new HttpHeaders({
          'header-a': 'value'
        })
      });
      spyOn(keycloak, 'addTokenToHeader').and.returnValue(
        of(
          new HttpHeaders({
            'header-a': 'value',
            Authorization: 'Bearer token'
          })
        )
      );

      let newRequest: HttpRequest<unknown> = null;
      await firstValueFrom(
        service.intercept(request, {
          handle: (req: HttpRequest<unknown>) => {
            newRequest = req;
            return of(null);
          }
        } as HttpHandler)
      );

      expect(keycloak['addTokenToHeader']).toHaveBeenCalled();
      expect(keycloak['updateToken']).toHaveBeenCalled();
    }
  ));

  it(`should not add token to request when 'shouldAddToken' returns false`, inject(
    [KeycloakBearerInterceptor],
    async (service: KeycloakBearerInterceptor) => {
      const request = new HttpRequest<unknown>('GET', 'test', {
        headers: new HttpHeaders({
          'header-a': 'value'
        })
      });
      spyOn(keycloak, 'shouldAddToken').and.returnValue(false);
      spyOn(keycloak, 'addTokenToHeader');

      let newRequest: HttpRequest<unknown> = null;
      await firstValueFrom(
        service.intercept(request, {
          handle: (req: HttpRequest<unknown>) => {
            newRequest = req;
            return of(null);
          }
        } as HttpHandler)
      );

      expect(keycloak['addTokenToHeader']).not.toHaveBeenCalled();
      expect(keycloak['updateToken']).not.toHaveBeenCalled();
    }
  ));

  it('should not call to update the keycloak token if the request has a header value that matches any value for any header in the exclusion list', inject(
    [KeycloakBearerInterceptor],
    async (service: KeycloakBearerInterceptor) => {
      const request = new HttpRequest<unknown>('GET', 'test', {
        headers: new HttpHeaders({
          'header-b': 'value2'
        })
      });
      spyOn(keycloak, 'shouldUpdateToken').and.returnValue(false);
      spyOn(keycloak, 'addTokenToHeader').and.returnValue(
        of(
          new HttpHeaders({
            'header-b': 'value2',
            Authorization: 'Bearer token'
          })
        )
      );

      let newRequest: HttpRequest<unknown> = null;
      await firstValueFrom(
        service.intercept(request, {
          handle: (req: HttpRequest<unknown>) => {
            newRequest = req;
            return of(null);
          }
        } as HttpHandler)
      );

      expect(keycloak['addTokenToHeader']).toHaveBeenCalled();
      expect(keycloak['updateToken']).not.toHaveBeenCalled();
    }
  ));

  it('should not call to update the keycloak token if the request has a header value that does not match any value for any header in the inclusion list', inject(
    [KeycloakBearerInterceptor],
    async (service: KeycloakBearerInterceptor) => {
      spyOnProperty(keycloak, 'includedUrls').and.returnValue([
        { urlPattern: /test/i, httpMethods: [] }
      ]);

      const request = new HttpRequest<unknown>('GET', 'test');

      spyOn(keycloak, 'addTokenToHeader').and.returnValue(
        of(new HttpHeaders({ Authorization: 'Bearer token' }))
      );

      let newRequest: HttpRequest<unknown> = null;
      await firstValueFrom(
        service.intercept(request, {
          handle: (req: HttpRequest<unknown>) => {
            newRequest = req;
            return of(null);
          }
        } as HttpHandler)
      );

      expect(keycloak['addTokenToHeader']).toHaveBeenCalled();
      expect(keycloak['updateToken']).toHaveBeenCalled();
    }
  ));
});
