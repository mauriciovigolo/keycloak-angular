/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { Injectable } from '@angular/core';

import { HttpHeaders } from '@angular/common/http';

// Workaround for rollup library behaviour, as pointed out on issue #1267 (https://github.com/rollup/rollup/issues/1267).
import * as Keycloak_ from 'keycloak-js';
export const Keycloak = Keycloak_;
import * as KeycloakAuthorization_ from 'keycloak-js/dist/keycloak-authz';
export const KeycloakAuthorization = KeycloakAuthorization_;

import { Observable, Observer, Subject } from 'rxjs';

import { KeycloakOptions } from '../interfaces/keycloak-options';
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
  private _bearerExcludedUrls: string[];
  /**
   * Observer for the keycloak events
   */
  private _keycloakEvents$: Subject<KeycloakEvent>;
  /**
   * The excluded urls patterns that must skip the KeycloakRptInterceptor.
   */
  private _rptExcludedUrls: string[];
  /**
   * Determines whether RPT interceptor should be activated
   * (keycloak-authz-js is initiated and RPT interceptor is enabled if true).
   */
  private _isEnableRPTInterceptor: boolean;
  /**
   * Keycloak-authz-js instance.
   */
  private _authzInstance: KeycloakAuthorization.KeycloakAuthorizationInstance;
  /**
   * String "uma" or "entitlement" specifies, which function of the two functions
   * KeycloakAuthorizationInstance.authorize() or KeycloakAuthorizationInstance.entitlement()
   * will be used to obtain RPT. When not set, UMA is used.
   */
  private _resourceServerAuthorizationType: string;
  /**
   * Resource server ID, only needed when resourceServerAuthorizationType is set to "entitlement";
   */
  private _resourceServerID: string;
  /**
   * Serves as a template for an Authroization Request consumed by functions
   * KeycloakAuthorizationInstance.authorize() and KeycloakAuthorizationInstance.entitlement().
   */
  private _authorizationRequestTemplate: KeycloakAuthorization.AuthorizationRequest;
  /**
   * This emitter is used by RPT Interceptor to notify that when new RPT was obtained.
   */
  private _RPTupdateEmitter: Observer<string>;
  /**
   * Observable that emits new RPT when it was updated by RPT interceptor.
   */
  private _RPTupdated$: Observable<string> = Observable.create(
    async (observer: Observer<string>) => {
      this._RPTupdateEmitter = observer;
    }
  );

  constructor() {
    this._keycloakEvents$ = new Subject<KeycloakEvent>();
  }

  /**
   * Sanitizes the bearer prefix, preparing it to be appended to
   * the token.
   *
   * @param bearerPrefix
   * Prefix to be appended to the authorization header as
   * Authorization: <bearer-prefix> <token>.
   * @returns
   * The bearer prefix sanitized, meaning that it will follow the bearerPrefix
   * param as described in the library initilization or the default value bearer,
   * with a space append in the end for the token concatenation.
   */
  private sanitizeBearerPrefix(bearerPrefix: string | undefined): string {
    let prefix: string = (bearerPrefix || 'bearer').trim();
    return prefix.concat(' ');
  }

  /**
   * Sets default value to true if it is undefined or null.
   *
   * @param value - boolean value to be checked
   */
  private ifUndefinedIsTrue(value: boolean): boolean {
    let returnValue: boolean = value;
    if (returnValue === undefined || returnValue === null) {
      returnValue = true;
    }
    return returnValue;
  }

  /**
   * Binds the keycloak-js events to the keycloakEvents Subject
   * which is a good way to monitor for changes, if needed.
   *
   * The keycloakEvents returns the keycloak-js event type and any
   * argument if the source function provides any.
   */
  private bindsKeycloakEvents(): void {
    if (!this._instance) {
      console.warn(
        'Keycloak Angular events could not be registered as the keycloak instance is undefined.'
      );
      return;
    }

    this._instance.onAuthError = errorData => {
      this._keycloakEvents$.next({ args: errorData, type: KeycloakEventType.OnAuthError });
    };

    this._instance.onAuthLogout = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthLogout });
    };

    this._instance.onAuthRefreshError = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthRefreshError });
    };

    this._instance.onAuthSuccess = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthSuccess });
    };

    this._instance.onTokenExpired = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnTokenExpired });
    };

    this._instance.onReady = authenticated => {
      this._keycloakEvents$.next({ args: authenticated, type: KeycloakEventType.OnReady });
    };
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
   * - onLoad: Specifies an action to do on load. Supported values are 'login-required' or
   * 'check-sso'.
   * - token: Set an initial value for the token.
   * - refreshToken: Set an initial value for the refresh token.
   * - idToken: Set an initial value for the id token (only together with token or refreshToken).
   * - timeSkew: Set an initial value for skew between local time and Keycloak server in seconds
   * (only together with token or refreshToken).
   * - checkLoginIframe: Set to enable/disable monitoring login state (default is true).
   * - checkLoginIframeInterval: Set the interval to check login state (default is 5 seconds).
   * - responseMode: Set the OpenID Connect response mode send to Keycloak server at login
   * request. Valid values are query or fragment . Default value is fragment, which means
   * that after successful authentication will Keycloak redirect to javascript application
   * with OpenID Connect parameters added in URL fragment. This is generally safer and
   * recommended over query.
   * - flow: Set the OpenID Connect flow. Valid values are standard, implicit or hybrid.
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
  init(options: KeycloakOptions = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._enableBearerInterceptor = this.ifUndefinedIsTrue(options.enableBearerInterceptor);
      this._loadUserProfileAtStartUp = this.ifUndefinedIsTrue(options.loadUserProfileAtStartUp);
      this._bearerExcludedUrls = options.bearerExcludedUrls || [];
      this._rptExcludedUrls = options.rptExcludedUrls || [];
      this._isEnableRPTInterceptor = options.enableRPTInterceptor || false;
      this._authorizationHeaderName = options.authorizationHeaderName || 'Authorization';
      this._bearerPrefix = this.sanitizeBearerPrefix(options.bearerPrefix);
      this._silentRefresh = options.initOptions ? options.initOptions.flow === 'implicit' : false;
      this._instance = Keycloak(options.config);
      this.bindsKeycloakEvents();
      this._instance
        .init(options.initOptions!)
        .success(async authenticated => {
          // the KeycloakAuthorization is initialized only when
          // enableRPTInterceptor from KeycloakOptions is set to true
          if (this._isEnableRPTInterceptor) {
            this._authzInstance = KeycloakAuthorization(this._instance);
            this._authorizationRequestTemplate = options.authorizationRequestTemplate || {};
            this._resourceServerAuthorizationType =
              options.resourceServerAuthorizationType || 'uma';
            this._resourceServerAuthorizationType = this._resourceServerAuthorizationType.toLowerCase();
            if (
              this._resourceServerAuthorizationType !== 'uma' &&
              this._resourceServerAuthorizationType !== 'entitlement'
            ) {
              options.resourceServerAuthorizationType = 'uma';
            }
            this._resourceServerID = options.resourceServerID || '';
          }
          if (authenticated && this._loadUserProfileAtStartUp) {
            await this.loadUserProfile();
          }
          resolve(authenticated);
        })
        .error(error => {
          reject('An error happened during Keycloak initialization.');
        });
    });
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
  login(options: Keycloak.KeycloakLoginOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this._instance
        .login(options)
        .success(async () => {
          if (this._loadUserProfileAtStartUp) {
            await this.loadUserProfile();
          }
          resolve();
        })
        .error(error => {
          reject('An error happened during the login.');
        });
    });
  }

  /**
   * Redirects to logout.
   *
   * @param redirectUri
   * Specifies the uri to redirect to after logout.
   * @returns
   * A void Promise if the logout was successful, cleaning also the userProfile.
   */
  logout(redirectUri?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: any = {
        redirectUri
      };

      this._instance
        .logout(options)
        .success(() => {
          this._userProfile = undefined!;
          resolve();
        })
        .error(error => {
          reject('An error happened during logout.');
        });
    });
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
  register(options: Keycloak.KeycloakLoginOptions = { action: 'register' }): Promise<void> {
    return new Promise((resolve, reject) => {
      this._instance
        .register(options)
        .success(() => {
          resolve();
        })
        .error(() => {
          reject('An error happened during the register execution');
        });
    });
  }

  /**
   * Check if the user has access to the specified role. It will look for roles in
   * realm and clientId, but will not check if the user is logged in for better performance.
   *
   * @param role
   * role name
   * @returns
   * A boolean meaning if the user has the specified Role.
   */
  isUserInRole(role: string): boolean {
    let hasRole: boolean;
    hasRole = this._instance.hasResourceRole(role);
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
      let realmRoles = this._instance.realmAccess['roles'] || [];
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
  isLoggedIn(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.updateToken(20);
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    });
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
  updateToken(minValidity: number = 5): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      // TODO: this is a workaround until the silent refresh (issue #43)
      // is not implemented, avoiding the redirect loop.
      if (this._silentRefresh) {
        if (this.isTokenExpired()) {
          reject('Failed to refresh the token, or the session is expired');
        } else {
          resolve(true);
        }
        return;
      }

      if (!this._instance) {
        reject();
        return;
      }

      this._instance
        .updateToken(minValidity)
        .success(refreshed => {
          resolve(refreshed);
        })
        .error(error => {
          reject('Failed to refresh the token, or the session is expired');
        });
    });
  }

  /**
   * Loads the users profile.
   * Returns promise to set functions to be invoked if the profile was loaded successfully, or if
   * the profile could not be loaded.
   *
   * @param forceReload
   * If true will force the loadUserProfile even if its already loaded.
   * @returns
   * A promise with the KeycloakProfile data loaded.
   */
  loadUserProfile(forceReload: boolean = false): Promise<Keycloak.KeycloakProfile> {
    return new Promise(async (resolve, reject) => {
      if (this._userProfile && !forceReload) {
        resolve(this._userProfile);
        return;
      }

      if (!(await this.isLoggedIn())) {
        reject('The user profile was not loaded as the user is not logged in.');
        return;
      }

      this._instance
        .loadUserProfile()
        .success(result => {
          this._userProfile = result as Keycloak.KeycloakProfile;
          resolve(this._userProfile);
        })
        .error(err => {
          reject('The user profile could not be loaded.');
        });
    });
  }

  /**
   * Returns the authenticated token, calling updateToken to get a refreshed one if
   * necessary. If the session is expired this method calls the login method for a new login.
   *
   * @returns
   * Promise with the generated token.
   */
  getToken(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.updateToken(10);
        resolve(this._instance.token);
      } catch (error) {
        this.login();
      }
    });
  }

  /**
   * Returns the logged username.
   *
   * @returns
   * The logged username.
   */
  getUsername(): string {
    if (!this._userProfile) {
      throw new Error('User not logged in or user profile was not loaded.');
    }

    return this._userProfile.username!;
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
  addTokenToHeader(headersArg?: HttpHeaders): Observable<HttpHeaders> {
    return Observable.create(async (observer: Observer<any>) => {
      let headers = headersArg;
      if (!headers) {
        headers = new HttpHeaders();
      }
      try {
        const token: string = await this.getToken();
        headers = headers.set(this._authorizationHeaderName, this._bearerPrefix + token);
        observer.next(headers);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
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
  get bearerExcludedUrls(): string[] {
    return this._bearerExcludedUrls;
  }

  /**
   * Returns the excluded URLs that should not be considered by
   * the RPT http interceptor which automatically adds the authorization header in the Http Request.
   *
   * @returns
   * The excluded urls that must not be intercepted by the KeycloakRptInterceptor.
   */
  get rptExcludedUrls(): string[] {
    return this._rptExcludedUrls;
  }

  /**
   * Returns true if authorization is enabled, false otherwise.
   *
   * @returns
   * true if authorization is enabled, false otherwise.
   */
  get isEnableRPTInterceptor(): boolean {
    return this._isEnableRPTInterceptor;
  }

  /**
   * Returns the original Keycloak Authorization instance from the official keycloak-js library.
   *
   * @returns
   */
  get keycloakAuthorizationInstance(): KeycloakAuthorization.KeycloakAuthorizationInstance {
    return this._authzInstance;
  }

  /**
   * Returns the RPT (Requesting Party Token) if it exists.
   *
   * @return
   */
  get RPT(): any {
    return this.keycloakAuthorizationInstance.rpt;
  }

  /**
   * Adds a requesting party token (RPT) token to header. The key: value format is:
   * Authorization: Bearer <token>.
   * If the headers param is undefined it will create the Angular headers object.
   *
   * @param headersArg updated header with Authorization and Keycloak token.
   */
  addRPTToHeader(headersArg?: HttpHeaders): HttpHeaders {
    let headers = headersArg;
    if (!headers) {
      headers = new HttpHeaders();
    }
    try {
      const token: string = this.keycloakAuthorizationInstance.rpt || '';
      headers = headers.set('Authorization', 'bearer ' + token);

      return headers;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @return
   * resourceServerAuthorizationType that was set in KeycloakOptions, "uma" or "entitlement"
   */
  get resourceServerAuthorizationType(): string {
    return this._resourceServerAuthorizationType;
  }

  /**
   * @return
   * authorizationRequestTemplate that was set in KeycloakOptions
   */
  get authorizationRequestTemplate(): KeycloakAuthorization.AuthorizationRequest {
    return this._authorizationRequestTemplate;
  }

  /**
   * @return
   * resourceServerID that was set in KeycloakOptions
   */
  get resourceServerID(): string {
    return this._resourceServerID;
  }

  /**
   * @return
   *  emitter which shoudl used to emit new RPT when it is obtained.
   */
  get RPTupdateEmitter(): Observer<string> {
    return this._RPTupdateEmitter;
  }

  /**
   * Observable that emits new RPT when it was updated by RPT interceptor.
   *
   * @returns
   * Observable that emits new RPT when it was updated by RPT interceptor
   */
  get RPTupdated(): Observable<string> {
    return this._RPTupdated$;
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
