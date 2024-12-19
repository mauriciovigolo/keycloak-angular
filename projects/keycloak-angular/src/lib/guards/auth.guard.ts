/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import Keycloak, { KeycloakResourceAccess } from 'keycloak-js';
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

/**
 * Type representing the roles granted to a user, including both realm and resource-level roles.
 */
type Roles = {
  /**
   * Roles assigned at the realm level.
   */
  realmRoles: string[];
  /**
   * Roles assigned at the resource level, organized by resource name.
   */
  resourceRoles: { [resource: string]: string[] };
};

/**
 * Data structure passed to the custom authorization guard to determine access.
 */
export type AuthGuardData = {
  /**
   * Indicates whether the user is currently authenticated.
   */
  authenticated: boolean;
  /**
   * A collection of roles granted to the user, including both realm and resource roles.
   */
  grantedRoles: Roles;
  /**
   * The Keycloak instance managing the user's session and access.
   */
  keycloak: Keycloak;
};

const mapResourceRoles = (resourceAccess: KeycloakResourceAccess = {}): Record<string, string[]> => {
  return Object.entries(resourceAccess).reduce<Record<string, string[]>>((roles, [key, value]) => {
    roles[key] = value.roles;
    return roles;
  }, {});
};

/**
 * Creates a custom authorization guard for Angular routes, enabling fine-grained access control.
 *
 * This guard invokes the provided `isAccessAllowed` function to determine if access is permitted
 * based on the current route, router state, and user's authentication and roles data.
 *
 * @template T - The type of the guard function (`CanActivateFn` or `CanActivateChildFn`).
 * @param isAccessAllowed - A callback function that evaluates access conditions. The function receives:
 *   - `route`: The current `ActivatedRouteSnapshot` for the route being accessed.
 *   - `state`: The current `RouterStateSnapshot` representing the router's state.
 *   - `authData`: An `AuthGuardData` object containing the user's authentication status, roles, and Keycloak instance.
 * @returns A guard function of type `T` that can be used as a route `canActivate` or `canActivateChild` guard.
 *
 * @example
 * ```ts
 * import { createAuthGuard } from './auth-guard';
 * import { Routes } from '@angular/router';
 *
 * const isUserAllowed = async (route, state, authData) => {
 *   const { authenticated, grantedRoles } = authData;
 *   return authenticated && grantedRoles.realmRoles.includes('admin');
 * };
 *
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     canActivate: [createAuthGuard(isUserAllowed)],
 *     component: AdminComponent,
 *   },
 * ];
 * ```
 */
export const createAuthGuard = <T extends CanActivateFn | CanActivateChildFn>(
  isAccessAllowed: (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ) => Promise<boolean | UrlTree>
): T => {
  return ((next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const keycloak = inject(Keycloak);

    const authenticated = keycloak?.authenticated ?? false;
    const grantedRoles: Roles = {
      resourceRoles: mapResourceRoles(keycloak?.resourceAccess),
      realmRoles: keycloak?.realmAccess?.roles ?? []
    };
    const authData = { authenticated, keycloak, grantedRoles };

    return isAccessAllowed(next, state, authData);
  }) as T;
};
