/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Subject, from } from 'rxjs';
import { map } from 'rxjs/operators';

// Workaround for rollup library behaviour, as pointed out on issue #1267 (https://github.com/rollup/rollup/issues/1267).
import * as Keycloak_ from 'keycloak-js';
export const Keycloak = Keycloak_;

import {
  ExcludedUrl,
  ExcludedUrlRegex,
  KeycloakOptions,
} from '../interfaces/keycloak-options';
import { KeycloakEvent, KeycloakEventType } from '../interfaces/keycloak-event';

/**
 * Service to expose existent methods from the Keycloak JS adapter, adding new
 * functionalities to improve the use of keycloak in Angular v > 4.3 applications.
 *
 * This class should be injected in the application bootstrap, so the same instance will be used
 * along the web application.
 */
@Injectable()
export class KeycloakService {
  /**
   * Keycloak-js instance.
   */
  private _instance: Keycloak.KeycloakInstance;
  /**
   * User profile as KeycloakProfile interface.
   */
  private _userProfile: Keycloak.KeycloakProfile;
  /**
   * Flag to indicate if the bearer will not be added to the authorization header.
   */
  private _enableBearerInterceptor: boolean;
  /**
   * When the implicit flow is choosen there must exist a silentRefresh, as there is
   * no refresh token.
   */
  private _silentRefresh: boolean;
  /**
   * Indicates that the user profile should be loaded at the keycloak initialization,
   * just after the login.
   */
  private _loadUserProfileAtStartUp: boolean;
  /**
   * The bearer prefix that will be appended to the Authorization Header.
   */
  private _bearerPrefix: string;
  /**
   * Value that will be used as the Authorization Http Header name.
   */
  private _authorizationHeaderName: string;
  /**
   * The excluded urls patterns that must skip the KeycloakBearerInterceptor.
   */
  private _excludedUrls: ExcludedUrlRegex[];
  /**
   * Observer for the keycloak events
   */
  private _keycloakEvents$: Subject<KeycloakEvent> = new Subject<
    KeycloakEvent
  >();

  /**
   * Binds the keycloak-js events to the keycloakEvents Subject
   * which is a good way to monitor for changes, if needed.
   *
   * The keycloakEvents returns the keycloak-js event type and any
   * argument if the source function provides any.
   */
  private bindsKeycloakEvents(): void {
    this._instance.onAuthError = (errorData) => {
      this._keycloakEvents$.next({
        args: errorData,
        type: KeycloakEventType.OnAuthError,
      });
    };

    this._instance.onAuthLogout = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthLogout });
    };

    this._instance.onAuthRefreshSuccess = () => {
      this._keycloakEvents$.next({
        type: KeycloakEventType.OnAuthRefreshSuccess,
      });
    };

    this._instance.onAuthRefreshError = () => {
      this._keycloakEvents$.next({
        type: KeycloakEventType.OnAuthRefreshError,
      });
    };

    this._instance.onAuthSuccess = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthSuccess });
    };

    this._instance.onTokenExpired = () => {
      this._keycloakEvents$.next({
        type: KeycloakEventType.OnTokenExpired,
      });
    };

    this._instance.onReady = (authenticated) => {
      this._keycloakEvents$.next({
        args: authenticated,
        type: KeycloakEventType.OnReady,
      });
    };
  }

  /**
   * Loads all bearerExcludedUrl content in a uniform type: ExcludedUrl,
   * so it becomes easier to handle.
   *
   * @param bearerExcludedUrls array of strings or ExcludedUrl that includes
   * the url and HttpMethod.
   */
  private loadExcludedUrls(
    bearerExcludedUrls: (string | ExcludedUrl)[]
  ): ExcludedUrlRegex[] {
    const excludedUrls: ExcludedUrlRegex[] = [];
    for (const item of bearerExcludedUrls) {
      let excludedUrl: ExcludedUrlRegex;
      if (typeof item === 'string') {
        excludedUrl = { urlPattern: new RegExp(item, 'i'), httpMethods: [] };
      } else {
        excludedUrl = {
          urlPattern: new RegExp(item.url, 'i'),
          httpMethods: item.httpMethods,
        };
      }
      excludedUrls.push(excludedUrl);
    }
    return excludedUrls;
  }

  /**
   * Handles the class values initialization.
   *
   * @param options
   */
  private initServiceValues({
    enableBearerInterceptor = true,
    loadUserProfileAtStartUp = false,
    bearerExcludedUrls = [],
    authorizationHeaderName = 'Authorization',
    bearerPrefix = 'Bearer',
    initOptions,
  }: KeycloakOptions): void {
    this._enableBearerInterceptor = enableBearerInterceptor;
    this._loadUserProfileAtStartUp = loadUserProfileAtStartUp;
    this._authorizationHeaderName = authorizationHeaderName;
    this._bearerPrefix = bearerPrefix.trim().concat(' ');
    this._excludedUrls = this.loadExcludedUrls(bearerExcludedUrls);
    this._silentRefresh = initOptions ? initOptions.flow === 'implicit' : false;
  }

  /**
   * Keycloak initialization. It should be called to initialize the adapter.
   * Options is a object with 2 main parameters: config and initOptions. The first one
   * will be used to create the Keycloak instance. The second one are options to initialize the
   * keycloak instance.
   *
   * @param options
   * Config: may be a string representing the keycloak URI or an object with the
   * following content:
   * - url: Keycloak json URL
   * - realm: realm name
   * - clientId: client id
   *
   * initOptions:
   * Options to initialize the Keycloak adapter, matches the options as provided by Keycloak itself.
   *
   * enableBearerInterceptor:
   * Flag to indicate if the bearer will added to the authorization header.
   *
   * loadUserProfileInStartUp:
   * Indicates that the user profile should be loaded at the keycloak initialization,
   * just after the login.
   *
   * bearerExcludedUrls:
   * String Array to exclude the urls that should not have the Authorization Header automatically
   * added.
   *
   * authorizationHeaderName:
   * This value will be used as the Authorization Http Header name.
   *
   * bearerPrefix:
   * This value will be included in the Authorization Http Header param.
   *
   * @returns
   * A Promise with a boolean indicating if the initialization was successful.
   */
  public async init(options: KeycloakOptions = {}) {
    this.initServiceValues(options);
    const { config, initOptions } = options;

    this._instance = Keycloak(config);
    this.bindsKeycloakEvents();

    const authenticated = await this._instance.init(initOptions);

    if (authenticated && this._loadUserProfileAtStartUp) {
      await this.loadUserProfile();
    }

    return authenticated;
  }

  /**
   * Redirects to login form on (options is an optional object with redirectUri and/or
   * prompt fields).
   *
   * @param options
   * Object, where:
   *  - redirectUri: Specifies the uri to redirect to after login.
   *  - prompt:By default the login screen is displayed if the user is not logged-in to Keycloak.
   * To only authenticate to the application if the user is already logged-in and not display the
   * login page if the user is not logged-in, set this option to none. To always require
   * re-authentication and ignore SSO, set this option to login .
   *  - maxAge: Used just if user is already authenticated. Specifies maximum time since the
   * authentication of user happened. If user is already authenticated for longer time than
   * maxAge, the SSO is ignored and he will need to re-authenticate again.
   *  - loginHint: Used to pre-fill the username/email field on the login form.
   *  - action: If value is 'register' then user is redirected to registration page, otherwise to
   * login page.
   *  - locale: Specifies the desired locale for the UI.
   * @returns
   * A void Promise if the login is successful and after the user profile loading.
   */
  public async login(options: Keycloak.KeycloakLoginOptions = {}) {
    await this._instance.login(options);

    if (this._loadUserProfileAtStartUp) {
      await this.loadUserProfile();
    }
  }

  /**
   * Redirects to logout.
   *
   * @param redirectUri
   * Specifies the uri to redirect to after logout.
   * @returns
   * A void Promise if the logout was successful, cleaning also the userProfile.
   */
  public async logout(redirectUri?: string) {
    const options = {
      redirectUri,
    };

    await this._instance.logout(options);
    this._userProfile = undefined;
  }

  /**
   * Redirects to registration form. Shortcut for login with option
   * action = 'register'. Options are same as for the login method but 'action' is set to
   * 'register'.
   *
   * @param options
   * login options
   * @returns
   * A void Promise if the register flow was successful.
   */
  public async register(
    options: Keycloak.KeycloakLoginOptions = { action: 'register' }
  ) {
    await this._instance.register(options);
  }

  /**
   * Check if the user has access to the specified role. It will look for roles in
   * realm and clientId, but will not check if the user is logged in for better performance.
   *
   * @param role
   * role name
   * @param resource
   * resource name If not specified, `clientId` is used
   * @returns
   * A boolean meaning if the user has the specified Role.
   */
  isUserInRole(role: string, resource?: string): boolean {
    let hasRole: boolean;
    hasRole = this._instance.hasResourceRole(role, resource);
    if (!hasRole) {
      hasRole = this._instance.hasRealmRole(role);
    }
    return hasRole;
  }

  /**
   * Return the roles of the logged user. The allRoles parameter, with default value
   * true, will return the clientId and realm roles associated with the logged user. If set to false
   * it will only return the user roles associated with the clientId.
   *
   * @param allRoles
   * Flag to set if all roles should be returned.(Optional: default value is true)
   * @returns
   * Array of Roles associated with the logged user.
   */
  getUserRoles(allRoles: boolean = true): string[] {
    let roles: string[] = [];
    if (this._instance.resourceAccess) {
      for (const key in this._instance.resourceAccess) {
        if (this._instance.resourceAccess.hasOwnProperty(key)) {
          const resourceAccess: any = this._instance.resourceAccess[key];
          const clientRoles = resourceAccess['roles'] || [];
          roles = roles.concat(clientRoles);
        }
      }
    }
    if (allRoles && this._instance.realmAccess) {
      const realmRoles = this._instance.realmAccess['roles'] || [];
      roles.push(...realmRoles);
    }
    return roles;
  }

  /**
   * Check if user is logged in.
   *
   * @returns
   * A boolean that indicates if the user is logged in.
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      if (!this._instance.authenticated) {
        return false;
      }
      await this.updateToken(20);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns true if the token has less than minValidity seconds left before
   * it expires.
   *
   * @param minValidity
   * Seconds left. (minValidity) is optional. Default value is 0.
   * @returns
   * Boolean indicating if the token is expired.
   */
  isTokenExpired(minValidity: number = 0): boolean {
    return this._instance.isTokenExpired(minValidity);
  }

  /**
   * If the token expires within minValidity seconds the token is refreshed. If the
   * session status iframe is enabled, the session status is also checked.
   * Returns a promise telling if the token was refreshed or not. If the session is not active
   * anymore, the promise is rejected.
   *
   * @param minValidity
   * Seconds left. (minValidity is optional, if not specified 5 is used)
   * @returns
   * Promise with a boolean indicating if the token was succesfully updated.
   */
  public async updateToken(minValidity = 5) {
    // TODO: this is a workaround until the silent refresh (issue #43)
    // is not implemented, avoiding the redirect loop.
    if (this._silentRefresh) {
      if (this.isTokenExpired()) {
        throw new Error(
          'Failed to refresh the token, or the session is expired'
        );
      }

      return true;
    }

    if (!this._instance) {
      throw new Error('Keycloak Angular library is not initialized.');
    }

    return this._instance.updateToken(minValidity);
  }

  /**
   * Loads the user profile.
   * Returns promise to set functions to be invoked if the profile was loaded
   * successfully, or if the profile could not be loaded.
   *
   * @param forceReload
   * If true will force the loadUserProfile even if its already loaded.
   * @returns
   * A promise with the KeycloakProfile data loaded.
   */
  public async loadUserProfile(forceReload = false) {
    if (this._userProfile && !forceReload) {
      return this._userProfile;
    }

    if (!this._instance.authenticated) {
      throw new Error(
        'The user profile was not loaded as the user is not logged in.'
      );
    }

    return this._userProfile = await this._instance.loadUserProfile();
  }

  /**
   * Returns the authenticated token, calling updateToken to get a refreshed one if necessary.
   */
  public async getToken() {
    await this.updateToken(10);
    return this._instance.token;
  }

  /**
   * Returns the logged username.
   *
   * @returns
   * The logged username.
   */
  public getUsername() {
    if (!this._userProfile) {
      throw new Error('User not logged in or user profile was not loaded.');
    }

    return this._userProfile.username;
  }

  /**
   * Clear authentication state, including tokens. This can be useful if application
   * has detected the session was expired, for example if updating token fails.
   * Invoking this results in onAuthLogout callback listener being invoked.
   */
  clearToken(): void {
    this._instance.clearToken();
  }

  /**
   * Adds a valid token in header. The key & value format is:
   * Authorization Bearer <token>.
   * If the headers param is undefined it will create the Angular headers object.
   *
   * @param headers
   * Updated header with Authorization and Keycloak token.
   * @returns
   * An observable with with the HTTP Authorization header and the current token.
   */
  public addTokenToHeader(headers: HttpHeaders = new HttpHeaders()) {
    return from(this.getToken()).pipe(
      map((token) =>
        token ? headers.set(this._authorizationHeaderName, this._bearerPrefix + token) : headers
      )
    );
  }

  /**
   * Returns the original Keycloak instance, if you need any customization that
   * this Angular service does not support yet. Use with caution.
   *
   * @returns
   * The KeycloakInstance from keycloak-js.
   */
  getKeycloakInstance(): Keycloak.KeycloakInstance {
    return this._instance;
  }

  /**
   * Returns the excluded URLs that should not be considered by
   * the http interceptor which automatically adds the authorization header in the Http Request.
   *
   * @returns
   * The excluded urls that must not be intercepted by the KeycloakBearerInterceptor.
   */
  get excludedUrls(): ExcludedUrlRegex[] {
    return this._excludedUrls;
  }

  /**
   * Flag to indicate if the bearer will be added to the authorization header.
   *
   * @returns
   * Returns if the bearer interceptor was set to be disabled.
   */
  get enableBearerInterceptor(): boolean {
    return this._enableBearerInterceptor;
  }

  /**
   * Keycloak subject to monitor the events triggered by keycloak-js.
   * The following events as available (as described at keycloak docs -
   * https://www.keycloak.org/docs/latest/securing_apps/index.html#callback-events):
   * - OnAuthError
   * - OnAuthLogout
   * - OnAuthRefreshError
   * - OnAuthRefreshSuccess
   * - OnAuthSuccess
   * - OnReady
   * - OnTokenExpire
   * In each occurrence of any of these, this subject will return the event type,
   * described at {@link KeycloakEventType} enum and the function args from the keycloak-js
   * if provided any.
   *
   * @returns
   * A subject with the {@link KeycloakEvent} which describes the event type and attaches the
   * function args.
   */
  get keycloakEvents$(): Subject<KeycloakEvent> {
    return this._keycloakEvents$;
  }
}
