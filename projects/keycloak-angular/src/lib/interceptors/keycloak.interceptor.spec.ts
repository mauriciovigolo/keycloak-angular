/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { HttpRequest, HttpHandlerFn, HttpHeaders } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';

import {
  createInterceptorCondition,
  conditionallyUpdateToken,
  addAuthorizationHeader,
  BearerTokenCondition
} from './keycloak.interceptor';

describe('Keycloak Interceptor Utilities', () => {
  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let mockNext: jasmine.Spy<HttpHandlerFn>;

  beforeEach(() => {
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['updateToken'], {
      token: 'mock-token'
    });
    mockNext = jasmine.createSpy('HttpHandlerFn').and.returnValue(of({}));
  });

  describe('createInterceptorCondition', () => {
    it('should apply default values when fields are missing', () => {
      const condition: Partial<BearerTokenCondition> = {};

      const result = createInterceptorCondition(condition);

      expect(result.bearerPrefix).toBe('Bearer');
      expect(result.authorizationHeaderName).toBe('Authorization');
      expect(result.shouldUpdateToken).toBeDefined();
      expect(result.shouldUpdateToken!(new HttpRequest('GET', '/'))).toBeTrue();
    });

    it('should not overwrite provided values', () => {
      const condition: BearerTokenCondition = {
        bearerPrefix: 'CustomPrefix',
        authorizationHeaderName: 'Custom-Authorization',
        shouldUpdateToken: () => false
      };

      const result = createInterceptorCondition(condition);

      expect(result.bearerPrefix).toBe('CustomPrefix');
      expect(result.authorizationHeaderName).toBe('Custom-Authorization');
      expect(result.shouldUpdateToken!(new HttpRequest('GET', '/'))).toBeFalse();
    });
  });

  describe('conditionallyUpdateToken', () => {
    it('should call updateToken if shouldUpdateToken returns true', async () => {
      const req = new HttpRequest('GET', '/');
      const condition: BearerTokenCondition = {
        shouldUpdateToken: () => true
      };
      mockKeycloak.updateToken.and.returnValue(Promise.resolve(true));

      const result = await conditionallyUpdateToken(req, mockKeycloak, condition);

      expect(mockKeycloak.updateToken).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should skip updateToken if shouldUpdateToken returns false', async () => {
      const req = new HttpRequest('GET', '/');
      const condition: BearerTokenCondition = {
        shouldUpdateToken: () => false
      };

      const result = await conditionallyUpdateToken(req, mockKeycloak, condition);

      expect(mockKeycloak.updateToken).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should return false if updateToken fails', async () => {
      const req = new HttpRequest('GET', '/');
      const condition: BearerTokenCondition = {
        shouldUpdateToken: () => true
      };
      mockKeycloak.updateToken.and.returnValue(Promise.reject('Token update failed'));

      const result = await conditionallyUpdateToken(req, mockKeycloak, condition);

      expect(mockKeycloak.updateToken).toHaveBeenCalled();
      expect(result).toBeFalse();
    });
  });

  describe('addAuthorizationHeader', () => {
    it('should add the default Authorization header with Bearer prefix', () => {
      const req = new HttpRequest('GET', '/api/data');

      addAuthorizationHeader(req, mockNext, mockKeycloak, {}).subscribe(() => {
        const interceptedReq = mockNext.calls.mostRecent().args[0];
        expect(interceptedReq.headers.get('Authorization')).toBe('Bearer mock-token');
        expect(mockNext).toHaveBeenCalledOnceWith(jasmine.any(HttpRequest));
      });
    });

    it('should use a custom Authorization header name and prefix', () => {
      const req = new HttpRequest('GET', '/api/data');
      const condition: BearerTokenCondition = {
        authorizationHeaderName: 'Custom-Auth',
        bearerPrefix: 'Token'
      };

      addAuthorizationHeader(req, mockNext, mockKeycloak, condition).subscribe(() => {
        const interceptedReq = mockNext.calls.mostRecent().args[0];
        expect(interceptedReq.headers.get('Custom-Auth')).toBe('Token mock-token');
        expect(mockNext).toHaveBeenCalledOnceWith(jasmine.any(HttpRequest));
      });
    });

    it('should preserve existing headers when adding Authorization', () => {
      const req = new HttpRequest('GET', '/api/data', {
        headers: new HttpHeaders({ 'Existing-Header': 'existing-value' })
      });

      addAuthorizationHeader(req, mockNext, mockKeycloak, {}).subscribe(() => {
        const interceptedReq = mockNext.calls.mostRecent().args[0];
        expect(interceptedReq.headers.get('Authorization')).toBe('Bearer mock-token');
        expect(interceptedReq.headers.get('Existing-Header')).toBe('existing-value');
      });
    });
  });
});
