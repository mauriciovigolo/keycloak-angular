/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import Keycloak from 'keycloak-js';
import { from, mergeMap, Observable } from 'rxjs';
import { inject, InjectionToken } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';

import { addAuthorizationHeader, conditionallyUpdateToken, BearerTokenCondition } from './keycloak.interceptor';

/**
 * Defines a custom condition for determining whether a Bearer token should be included
 * in the `Authorization` header of an outgoing HTTP request.
 *
 * This type extends the `BearerTokenCondition` type and adds a dynamic function
 * (`shouldAddToken`) that evaluates whether the token should be added based on the
 * request, handler, and Keycloak state.
 */
export type CustomBearerTokenCondition = Partial<BearerTokenCondition> & {
  /**
   * A function that dynamically determines whether the Bearer token should be included
   * in the `Authorization` header for a given request.
   *
   * This function is asynchronous and receives the following arguments:
   * - `req`: The `HttpRequest` object representing the current outgoing HTTP request.
   * - `next`: The `HttpHandlerFn` for forwarding the request to the next handler in the chain.
   * - `keycloak`: The `Keycloak` instance representing the authentication context.
   */
  shouldAddToken: (req: HttpRequest<unknown>, next: HttpHandlerFn, keycloak: Keycloak) => Promise<boolean>;
};

/**
 * Injection token for configuring the `customBearerTokenInterceptor`.
 *
 * This injection token holds an array of `CustomBearerTokenCondition` objects, which define
 * the conditions under which a Bearer token should be included in the `Authorization` header
 * of outgoing HTTP requests. Each condition provides a `shouldAddToken` function that dynamically
 * determines whether the token should be added based on the request, handler, and Keycloak state.
 */
export const CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG = new InjectionToken<CustomBearerTokenCondition[]>(
  'Include the bearer token as implemented by the provided function'
);

/**
 * Custom HTTP Interceptor for dynamically adding a Bearer token to requests based on conditions.
 *
 * This interceptor uses a flexible approach where the decision to include a Bearer token in the
 * `Authorization` HTTP header is determined by a user-provided function (`shouldAddToken`).
 * This enables a dynamic and granular control over when tokens are added to HTTP requests.
 *
 * ### Key Features:
 * 1. **Dynamic Token Inclusion**: Uses a condition function (`shouldAddToken`) to decide dynamically
 *    whether to add the token based on the request, Keycloak state, and other factors.
 * 2. **Token Management**: Optionally refreshes the Keycloak token before adding it to the request.
 * 3. **Controlled Authorization**: Adds the Bearer token only when the condition function allows
 *    and the user is authenticated in Keycloak.
 *
 * ### Configuration:
 * The interceptor relies on `CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG`, an injection token that contains
 * an array of `CustomBearerTokenCondition` objects. Each condition specifies a `shouldAddToken` function
 * that determines whether to add the Bearer token for a given request.
 *
 * ### Workflow:
 * 1. Reads the conditions from the `CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG` injection token.
 * 2. Iterates through the conditions and evaluates the `shouldAddToken` function for the request.
 * 3. If a condition matches:
 *    - Optionally refreshes the Keycloak token if needed.
 *    - Adds the Bearer token to the request's `Authorization` header if the user is authenticated.
 * 4. If no conditions match, the request proceeds unchanged.
 *
 * ### Parameters:
 * @param req - The `HttpRequest` object representing the outgoing HTTP request.
 * @param next - The `HttpHandlerFn` for passing the request to the next handler in the chain.
 *
 * @returns An `Observable<HttpEvent<unknown>>` representing the HTTP response.
 *
 * ### Usage Example:
 * ```typescript
 * // Define a custom condition to include the token
 * const customCondition: CustomBearerTokenCondition = {
 *   shouldAddToken: async (req, next, keycloak) => {
 *     // Add token only for requests to the /api endpoint
 *     return req.url.startsWith('/api') && keycloak.authenticated;
 *   },
 * };
 *
 * // Configure the interceptor with the custom condition
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([customBearerTokenInterceptor])),
 *     {
 *       provide: CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG,
 *       useValue: [customCondition],
 *     },
 *   ],
 * };
 * ```
 */
export const customBearerTokenInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const conditions = inject(CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG) ?? [];

  const keycloak = inject(Keycloak);

  return from(
    Promise.all(conditions.map(async (condition) => await condition.shouldAddToken(req, next, keycloak)))
  ).pipe(
    mergeMap((evaluatedConditions) => {
      const matchingConditionIndex = evaluatedConditions.findIndex(Boolean);
      const matchingCondition = conditions[matchingConditionIndex];

      if (!matchingCondition) {
        return next(req);
      }

      return from(conditionallyUpdateToken(req, keycloak, matchingCondition)).pipe(
        mergeMap(() =>
          keycloak.authenticated ? addAuthorizationHeader(req, next, keycloak, matchingCondition) : next(req)
        )
      );
    })
  );
};
