/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import Keycloak from 'keycloak-js';

import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  IncludeBearerTokenCondition
} from './include-bearer-token.interceptor';

describe('includeBearerTokenInterceptor', () => {
  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let handlerFn: jasmine.Spy<HttpHandlerFn>;
  let request: HttpRequest<unknown>;

  beforeEach(() => {
    mockKeycloak = jasmine.createSpyObj<Keycloak>('Keycloak', ['updateToken', 'authenticated']);
    mockKeycloak.authenticated = true;
    mockKeycloak.token = 'mockToken';
    mockKeycloak.updateToken.and.resolveTo(true);

    handlerFn = jasmine
      .createSpy('HttpHandlerFn')
      .and.callFake((_: HttpRequest<unknown>) => of({} as HttpEvent<unknown>));

    request = new HttpRequest('GET', 'https://api.internal.myapp.com/resource');

    TestBed.configureTestingModule({
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        {
          provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [
            {
              urlPattern: /^https:\/\/api\.internal\.myapp\.com\/.*/,
              httpMethods: ['GET', 'POST']
            }
          ] as IncludeBearerTokenCondition[]
        }
      ]
    });
  });

  it('should proceed without modification if no conditions match', (done) => {
    request = new HttpRequest('PUT', 'https://api.internal.myapp.com/resource', {});

    TestBed.runInInjectionContext(() => {
      const result = includeBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalledWith(request);
        expect(handlerFn.calls.count()).toBe(1);
        done();
      });
    });
  });

  it('should add the Bearer token if conditions match and user is authenticated', (done) => {
    TestBed.runInInjectionContext(() => {
      const result = includeBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalled();
        const forwardedRequest = handlerFn.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer mockToken');
        done();
      });
    });
  });

  it('should proceed without adding a token if user is not authenticated', (done) => {
    mockKeycloak.authenticated = false;

    TestBed.runInInjectionContext(() => {
      const result = includeBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalledWith(request);
        const forwardedRequest = handlerFn.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(forwardedRequest.headers.get('Authorization')).toBeNull();
        done();
      });
    });
  });

  it('should handle multiple conditions and match the correct one', (done) => {
    TestBed.overrideProvider(INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, {
      useValue: [
        {
          urlPattern: /^https:\/\/api\.internal\.myapp\.com\/public/,
          httpMethods: ['GET']
        },
        {
          urlPattern: /^https:\/\/api\.internal\.myapp\.com\/resource/,
          httpMethods: ['GET', 'POST']
        }
      ] as IncludeBearerTokenCondition[]
    });

    TestBed.runInInjectionContext(() => {
      const result = includeBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalled();
        const forwardedRequest = handlerFn.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer mockToken');
        done();
      });
    });
  });
});
