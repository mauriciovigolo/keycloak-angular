/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { Observable } from 'rxjs';
import Keycloak from 'keycloak-js';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';

/**
 * Default value for the authorization header prefix, used to construct the Authorization token.
 */
const BEARER_PREFIX = 'Bearer';
/**
 * Default name of the authorization header.
 */
const AUTHORIZATION_HEADER_NAME = 'Authorization';
/**
 * Represents the HTTP methods supported by the interceptor for authorization purposes.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';

/**
 * Common attributes for the Auth Bearer interceptor that can be reused in other interceptor implementations.
 */
export type BearerTokenCondition = {
  /**
   * Prefix to be used in the Authorization header. Default is "Bearer".
   * This will result in a header formatted as: `Authorization: Bearer <token>`.
   *
   * Adjust this value if your backend expects a different prefix in the Authorization header.
   */
  bearerPrefix?: string;
  /**
   * Name of the HTTP header used for authorization. Default is "Authorization".
   * Customize this value if your backend expects a different header, e.g., "JWT-Authorization".
   */
  authorizationHeaderName?: string;
  /**
   * Function to determine whether the token should be updated before a request. Default is a function returning true.
   * If the function returns `true`, the token's validity will be checked and updated if needed.
   * If it returns `false`, the token update process will be skipped for that request.
   *
   * @param request - The current `HttpRequest` object being intercepted.
   * @returns A boolean indicating whether to update the token.
   */

  shouldUpdateToken?: (request: HttpRequest<unknown>) => boolean;
};

/**
 * Generic factory function to create an interceptor condition with default values.
 *
 * This utility allows you to define custom interceptor conditions while ensuring that
 * default values are applied to any missing fields. By using generics, you can enforce
 * strong typing when creating the fields for the interceptor condition, enhancing type safety.
 *
 * @template T - A type that extends `AuthBearerCondition`.
 * @param value - An object of type `T` (extending `AuthBearerCondition`) to be enhanced with default values.
 * @returns A new object of type `T` with default values assigned to any undefined properties.
 */
export const createInterceptorCondition = <T extends BearerTokenCondition>(value: T): T => ({
  ...value,
  bearerPrefix: value.bearerPrefix ?? BEARER_PREFIX,
  authorizationHeaderName: value.authorizationHeaderName ?? AUTHORIZATION_HEADER_NAME,
  shouldUpdateToken: value.shouldUpdateToken ?? (() => true)
});

/**
 * Conditionally updates the Keycloak token based on the provided request and conditions.
 *
 * @param req - The `HttpRequest` object being processed.
 * @param keycloak - The Keycloak instance managing authentication.
 * @param condition - An `AuthBearerCondition` object with the `shouldUpdateToken` function.
 * @returns A `Promise<boolean>` indicating whether the token was successfully updated.
 */
export const conditionallyUpdateToken = async (
  req: HttpRequest<unknown>,
  keycloak: Keycloak,
  { shouldUpdateToken = (_) => true }: BearerTokenCondition
): Promise<boolean> => {
  if (shouldUpdateToken(req)) {
    return await keycloak.updateToken().catch(() => false);
  }
  return true;
};

/**
 * Adds the Authorization header to an HTTP request and forwards it to the next handler.
 *
 * @param req - The original `HttpRequest` object.
 * @param next - The `HttpHandlerFn` function for forwarding the HTTP request.
 * @param keycloak - The Keycloak instance providing the authentication token.
 * @param condition - An `AuthBearerCondition` object specifying header configuration.
 * @returns An `Observable<HttpEvent<unknown>>` representing the HTTP response.
 */
export const addAuthorizationHeader = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  keycloak: Keycloak,
  condition: BearerTokenCondition
): Observable<HttpEvent<unknown>> => {
  const { bearerPrefix = BEARER_PREFIX, authorizationHeaderName = AUTHORIZATION_HEADER_NAME } = condition;

  const clonedRequest = req.clone({
    setHeaders: {
      [authorizationHeaderName]: `${bearerPrefix} ${keycloak.token}`
    }
  });

  return next(clonedRequest);
};
