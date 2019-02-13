/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { KeycloakInitOptions } from './keycloak-init-options';
import { KeycloakConfig } from './keycloak-config';

/**
 * HTTP Methods
 */
export type HttpMethods =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'PATCH';

/**
 * UrlMatcher type may be used to specify the url and the HTTP method that
 * should not be intercepted by the KeycloakBearerInterceptor or should be whitelisted.
 *
 * Example:
 * const excludedUrl: UrlMatcher[] = [
 *  {
 *    url: 'reports/public'
 *    httpMethods: ['GET']
 *  }
 * ]
 *
 * In the example above for URL reports/public and HTTP Method GET the
 * bearer will not be automatically added.
 *
 * If the url is informed but httpMethod is undefined, then the bearer
 * will not be added for all HTTP Methods.
 */
export interface UrlMatcher {
  url: string;
  httpMethods?: HttpMethods[];
}

/**
 * Similar to UrlMatcher, contains the HTTP methods and a regex to
 * include the url patterns.
 * This interface is used internally by the KeycloakService.
 */
export interface UrlMatcherRegEx {
  urlPattern: RegExp;
  httpMethods?: HttpMethods[];
}

/**
 * keycloak-angular initialization options.
 */
export interface KeycloakOptions {
  /**
   * Configs to init the keycloak-js library. If undefined, will look for a keycloak.json file
   * at root of the project.
   * If not undefined, can be a string meaning the url to the keycloak.json file or an object
   * of {@link KeycloakConfig}. Use this configuration if you want to specify the keycloak server,
   * realm, clientId. This is usefull if you have different configurations for production, stage
   * and development environments. Hint: Make use of Angular environment configuration.
   */
  config?: string | KeycloakConfig;
  /**
   * Options to initialize the adapter. Used by keycloak-js.
   */
  initOptions?: KeycloakInitOptions;
  /**
   * By default all requests made by Angular HttpClient will be intercepted in order to
   * add the bearer in the Authorization Http Header. However, if this is a not desired
   * feature, the enableBearerInterceptor must be false.
   *
   * Briefly, if enableBearerInterceptor === false, the bearer will not be added
   * to the authorization header.
   *
   * The default value is true.
   */
  enableBearerInterceptor?: boolean;
  /**
   * Forces the execution of loadUserProfile after the keycloak initialization considering that the
   * user logged in.
   * This option is recommended if is desirable to have the user details at the beginning,
   * so after the login, the loadUserProfile function will be called and it's value cached.
   *
   * The default value is true.
   */
  loadUserProfileAtStartUp?: boolean;
  /**
   * String Array to exclude the urls that should not have the Authorization Header automatically
   * added. This library makes use of Angular Http Interceptor, to automatically add the Bearer
   * token to the request.
   */
  bearerExcludedUrls?: (string | UrlMatcher)[];
  /**
   * This value will be used as the Authorization Http Header name. The default value is
   * **Authorization**. If the backend expects requests to have a token in a different header, you
   * should change this value, i.e: **JWT-Authorization**. This will result in a Http Header
   * Authorization as "JWT-Authorization: bearer <token>".
   */
  authorizationHeaderName?: string;
  /**
   * This value will be included in the Authorization Http Header param. The default value is
   * **bearer**, which will result in a Http Header Authorization as "Authorization: bearer <token>".
   * If any other value is needed by the backend in the authorization header, you should change this
   * value, i.e: **Bearer**.
   *
   * Warning: this value must be in compliance with the keycloak server instance and the adapter.
   */
  bearerPrefix?: string;
  /**
   * Forces the user to explicitly white list URLs KeycloakBearerInterceptor is allowed to add the
   * Authorization Header to.
   * If enabled, use the bearerIncludedUrls setting to white list.
   */
  enableBearerWhiteListing?: boolean;
  /**
   * String Array to white list urls that should have the Authorization Header automatically added.
   * Only used if enableBearerWhiteListing is set.
   */
  bearerIncludedUrls?: (string | UrlMatcher)[];
}
