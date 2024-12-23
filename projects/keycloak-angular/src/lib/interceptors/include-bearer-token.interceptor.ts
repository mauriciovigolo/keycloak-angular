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

import {
  addAuthorizationHeader,
  conditionallyUpdateToken,
  HttpMethod,
  BearerTokenCondition
} from './keycloak.interceptor';

/**
 * Defines the conditions for including the Bearer token in the Authorization HTTP header.
 */
export type IncludeBearerTokenCondition = Partial<BearerTokenCondition> & {
  /**
   * A URL pattern (as a `RegExp`) used to determine whether the Bearer token should be added
   * to the Authorization HTTP header for a given request. The Bearer token is only added if
   * this pattern matches the request's URL.
   *
   * This EXPLICIT configuration is for security purposes, ensuring that internal tokens are not
   * shared with unintended services.
   */
  urlPattern: RegExp;
  /**
   * An optional array of HTTP methods (`HttpMethod[]`) to further refine the conditions under
   * which the Bearer token is added. If not provided, the default behavior is to add the token
   * for all HTTP methods matching the `urlPattern`.
   */
  httpMethods?: HttpMethod[];
};

/**
 * Injection token for configuring the `includeBearerTokenInterceptor`, allowing the specification
 * of conditions under which the Bearer token should be included in HTTP request headers.
 *
 * This configuration supports multiple conditions, enabling customization for different URLs.
 * It also provides options to tailor the Bearer prefix and the Authorization header name as needed.
 */
export const INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG = new InjectionToken<IncludeBearerTokenCondition[]>(
  'Include the bearer token when explicitly defined int the URL pattern condition'
);

const findMatchingCondition = (
  { method, url }: HttpRequest<unknown>,
  { urlPattern, httpMethods = [] }: IncludeBearerTokenCondition
): boolean => {
  const httpMethodTest = httpMethods.length === 0 || httpMethods.join().indexOf(method.toUpperCase()) > -1;

  const urlTest = urlPattern.test(url);

  return httpMethodTest && urlTest;
};

/**
 * HTTP Interceptor to include a Bearer token in the Authorization header for specific HTTP requests.
 *
 * This interceptor ensures that a Bearer token is added to outgoing HTTP requests based on explicitly
 * defined conditions. By default, the interceptor does not include the Bearer token unless the request
 * matches the provided configuration (`IncludeBearerTokenCondition`). This approach enhances security
 * by preventing sensitive tokens from being unintentionally sent to unauthorized services.
 *
 * ### Features:
 * 1. **Explicit URL Matching**: The interceptor uses regular expressions to match URLs where the Bearer token should be included.
 * 2. **HTTP Method Filtering**: Optional filtering by HTTP methods (e.g., `GET`, `POST`, `PUT`) to refine the conditions for adding the token.
 * 3. **Token Management**: Ensures the Keycloak token is valid by optionally refreshing it before attaching it to the request.
 * 4. **Controlled Authorization**: Sends the token only for requests where the user is authenticated, and the conditions match.
 *
 * ### Workflow:
 * - Reads conditions from `INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG`, which specifies when the Bearer token should be included.
 * - If a request matches the conditions:
 *   1. The Keycloak token is refreshed if needed.
 *   2. The Bearer token is added to the Authorization header.
 *   3. The modified request is passed to the next handler.
 * - If no conditions match, the request proceeds unchanged.
 *
 * ### Security:
 * By explicitly defining URL patterns and optional HTTP methods, this interceptor prevents the leakage of tokens
 * to unintended endpoints, such as third-party APIs or external services. This is especially critical for applications
 * that interact with both internal and external services.
 *
 * @param req - The `HttpRequest` object representing the outgoing HTTP request.
 * @param next - The `HttpHandlerFn` for passing the request to the next handler in the chain.
 * @returns An `Observable<HttpEvent<unknown>>` representing the asynchronous HTTP response.
 *
 * ### Configuration:
 * The interceptor relies on `INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG`, an injection token that holds
 * an array of `IncludeBearerTokenCondition` objects. Each object defines the conditions for including
 * the Bearer token in the request.
 *
 * #### Example Configuration:
 * ```typescript
 * provideHttpClient(
 *   withInterceptors([includeBearerTokenInterceptor]),
 *   {
 *     provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
 *     useValue: [
 *       {
 *         urlPattern: /^https:\/\/api\.internal\.myapp\.com\/.*\/,
 *         httpMethods: ['GET', 'POST'], // Add the token only for GET and POST methods
 *       },
 *     ],
 *   }
 * );
 * ```
 *
 * ### Example Usage:
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
 *     provideZoneChangeDetection({ eventCoalescing: true }),
 *     provideRouter(routes),
 *   ],
 * };
 * ```
 *
 * ### Example Matching Condition:
 * ```typescript
 * {
 *   urlPattern: /^(https:\/\/internal\.mycompany\.com)(\/.*)?$/i,
 *   httpMethods: ['GET', 'PUT'], // Optional: Match only specific HTTP methods
 * }
 * ```
 */
export const includeBearerTokenInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const conditions = inject(INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG) ?? [];

  const matchingCondition = conditions.find((condition) => findMatchingCondition(req, condition));
  if (!matchingCondition) {
    return next(req);
  }

  const keycloak = inject(Keycloak);

  return from(conditionallyUpdateToken(req, keycloak, matchingCondition)).pipe(
    mergeMap(() =>
      keycloak.authenticated ? addAuthorizationHeader(req, next, keycloak, matchingCondition) : next(req)
    )
  );
};
