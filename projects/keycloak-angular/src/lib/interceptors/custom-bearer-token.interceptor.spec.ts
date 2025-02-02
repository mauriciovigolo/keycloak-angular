import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import Keycloak from 'keycloak-js';

import {
  CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  CustomBearerTokenCondition,
  customBearerTokenInterceptor
} from './custom-bearer-token.interceptor';

describe('customBearerTokenInterceptor', () => {
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
      .and.callFake((req: HttpRequest<unknown>) => of({} as HttpEvent<unknown>));

    request = new HttpRequest('GET', '/api/resource');

    TestBed.configureTestingModule({
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        {
          provide: CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [
            {
              shouldAddToken: async (req, next, keycloak) => req.url.startsWith('/api') && keycloak.authenticated
            }
          ] as CustomBearerTokenCondition[]
        }
      ]
    });
  });

  it('should add the Bearer token if conditions match and user is authenticated', (done) => {
    TestBed.runInInjectionContext(() => {
      const result = customBearerTokenInterceptor(request, handlerFn);

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
      const result = customBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalledWith(request);
        const forwardedRequest = handlerFn.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(forwardedRequest.headers.get('Authorization')).toBeNull();
        done();
      });
    });
  });

  it('should evaluate multiple conditions and apply the correct one', (done) => {
    TestBed.overrideProvider(CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG, {
      useValue: [
        {
          shouldAddToken: async (req, next, keycloak) => req.url.startsWith('/public') && keycloak.authenticated
        },
        {
          shouldAddToken: async (req, next, keycloak) => req.url.startsWith('/api') && keycloak.authenticated
        }
      ] as CustomBearerTokenCondition[]
    });

    TestBed.runInInjectionContext(() => {
      const result = customBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalled();
        const forwardedRequest = handlerFn.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer mockToken');
        done();
      });
    });
  });

  it('should evaluate multiple async conditions and apply the correct one', (done) => {
    TestBed.overrideProvider(CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG, {
      useValue: [
        {
          shouldAddToken: async (req, next, keycloak) => false
        },
        {
          shouldAddToken: async (req, next, keycloak) => req.url.startsWith('/api') && keycloak.authenticated,
          authorizationHeaderName: 'DifferentAuthorization'
        }
      ] as CustomBearerTokenCondition[]
    });

    TestBed.runInInjectionContext(() => {
      const result = customBearerTokenInterceptor(request, handlerFn);

      result.subscribe(() => {
        expect(handlerFn).toHaveBeenCalled();
        const forwardedRequest = handlerFn.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(forwardedRequest.headers.get('DifferentAuthorization')).toBe('Bearer mockToken');
        done();
      });
    });
  });
});
