/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

import { createAuthGuard } from './auth.guard';

describe('createAuthGuard', () => {
  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let mockIsAccessAllowed: jasmine.Spy;

  beforeEach(() => {
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['init', 'login']);
    mockKeycloak.authenticated = false;
    mockKeycloak.realmAccess = { roles: [] };
    mockKeycloak.resourceAccess = {};

    mockIsAccessAllowed = jasmine.createSpy('isAccessAllowed');

    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: mockKeycloak }]
    });
  });

  it('should return false if the user is not authenticated', async () => {
    mockIsAccessAllowed.and.returnValue(Promise.resolve(false));

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/test' } as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => {
      const guard = createAuthGuard(mockIsAccessAllowed);
      return guard(route, state);
    });

    expect(mockIsAccessAllowed).toHaveBeenCalledWith(route, state, {
      authenticated: false,
      keycloak: mockKeycloak,
      grantedRoles: { realmRoles: [], resourceRoles: {} }
    });
    expect(result).toBeFalse();
  });

  it('should call isAccessAllowed with proper auth data when authenticated', async () => {
    mockKeycloak.authenticated = true;
    mockKeycloak.realmAccess = { roles: ['admin'] };
    mockKeycloak.resourceAccess = { resource1: { roles: ['editor'] } };

    mockIsAccessAllowed.and.returnValue(Promise.resolve(true));

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => {
      const guard = createAuthGuard(mockIsAccessAllowed);
      return guard(route, state);
    });

    expect(mockIsAccessAllowed).toHaveBeenCalledWith(route, state, {
      authenticated: true,
      keycloak: mockKeycloak,
      grantedRoles: {
        realmRoles: ['admin'],
        resourceRoles: { resource1: ['editor'] }
      }
    });
    expect(result).toBeTrue();
  });

  it('should return a UrlTree if isAccessAllowed resolves to it', async () => {
    const mockUrlTree = { toString: () => '/login' } as unknown as UrlTree;
    mockIsAccessAllowed.and.returnValue(Promise.resolve(mockUrlTree));

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/secure' } as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => {
      const guard = createAuthGuard(mockIsAccessAllowed);
      return guard(route, state);
    });

    expect(result).toBe(mockUrlTree);
    expect(mockIsAccessAllowed).toHaveBeenCalled();
  });

  it('should handle undefined realmAccess and resourceAccess gracefully', async () => {
    mockKeycloak.authenticated = true;
    mockKeycloak.realmAccess = undefined;
    mockKeycloak.resourceAccess = undefined;

    mockIsAccessAllowed.and.returnValue(Promise.resolve(true));

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/any' } as RouterStateSnapshot;

    const result = await TestBed.runInInjectionContext(() => {
      const guard = createAuthGuard(mockIsAccessAllowed);
      return guard(route, state);
    });

    expect(mockIsAccessAllowed).toHaveBeenCalledWith(route, state, {
      authenticated: true,
      keycloak: mockKeycloak,
      grantedRoles: {
        realmRoles: [],
        resourceRoles: {}
      }
    });
    expect(result).toBeTrue();
  });
});
