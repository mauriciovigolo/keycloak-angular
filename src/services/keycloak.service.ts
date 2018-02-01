/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import * as Keycloak from 'keycloak-js';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { KeycloakConfig, KeycloakOptions } from '../interfaces';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/create';

/**
 * Service to expose existent methods from the Keycloak JS adapter, adding new
 * functionalities to improve the use of keycloak in Angular v > 4.3 applications.
 *
 * This class should be injected in the application bootstrap, so the same instance will be used
 * along the web application.
 */
@Injectable()
export class KeycloakService {
  private instance: Keycloak.KeycloakInstance;
  private userProfile: Keycloak.KeycloakProfile;
  private bearerExcludedUrls: string[];

  /**
   * Keycloak initialization. It should be called to initialize the adapter.
   * Options is a object with 2 main parameters: config and initOptions. The first one
   * will be used to create the Keycloak instance. The second one are options to initialize the
   * keycloak instance.
   *
   * @param {KeycloakOptions} options
   * config: may be a string representing the keycloak URI or an object with the
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
   * @return {Promise<boolean>}
   */
  init(options: KeycloakOptions = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.bearerExcludedUrls = options.bearerExcludedUrls || [];
      this.instance = Keycloak(options.config);
      this.instance
        .init(options.initOptions!)
        .success(async authenticated => {
          if (authenticated) {
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
   * @param {Keycloak.KeycloakLoginOptions} - Object, where:
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
   * @returns Promise containing the
   */
  login(options: Keycloak.KeycloakLoginOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.instance
        .login(options)
        .success(async () => {
          await this.loadUserProfile();
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
   * @param {string} redirectUri Specifies the uri to redirect to after logout.
   */
  logout(redirectUri?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options: any = {
        redirectUri
      };

      this.instance
        .logout(options)
        .success(() => {
          this.userProfile = undefined!;
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
   * @param {Keycloak.KeycloakLoginOptions} options login options
   */
  register(options: Keycloak.KeycloakLoginOptions = { action: 'register' }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.instance
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
   * @param {string} role - role name
   * @return {boolean}
   */
  isUserInRole(role: string): boolean {
    let hasRole: boolean;
    hasRole = this.instance.hasResourceRole(role);
    if (!hasRole) {
      hasRole = this.instance.hasRealmRole(role);
    }
    return hasRole;
  }

  /**
   * Return the roles of the logged user. The allRoles parameter, with default value
   * true, will return the clientId and realm roles associated with the logged user. If set to false
   * it will only return the user roles associated with the clientId.
   *
   * @param {boolean} allRoles - flag to set if all roles should be returned.(Optional: default
   * value is true)
   * @return {string[]} - roles list associated with the logged user.
   */
  getUserRoles(allRoles: boolean = true): string[] {
    let roles: string[] = [];
    if (this.instance.resourceAccess) {
      for (const key in this.instance.resourceAccess) {
        if (this.instance.resourceAccess.hasOwnProperty(key)) {
          const resourceAccess: any = this.instance.resourceAccess[key];
          const clientRoles = resourceAccess['roles'] || [];
          roles = roles.concat(clientRoles);
        }
      }
    }
    if (allRoles && this.instance.realmAccess) {
      roles = this.instance.realmAccess['roles'] || [];
    }
    return roles;
  }

  /**
   * Check if user is logged in.
   *
   * @return {boolean}
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
   * @param {number} minValidity seconds left. (minValidity) is optional. Default value is 0.
   * @return {boolean}
   */
  isTokenExpired(minValidity: number = 0): boolean {
    return this.instance.isTokenExpired(minValidity);
  }

  /**
   * If the token expires within minValidity seconds the token is refreshed. If the
   * session status iframe is enabled, the session status is also checked.
   * Returns a promise telling if the token was refreshed or not. If the session is not active
   * anymore, the promise is rejected.
   *
   * @param {number} minValidity - seconds left. (minValidity is optional, if not specified 5
   * is used)
   * @return {Promise<boolean>}
   */
  updateToken(minValidity: number = 5): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!this.instance) {
        reject(false);
        return;
      }

      this.instance
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
   * @return {Promise<Keycloak.KeycloakProfile>}
   */
  loadUserProfile(forceReload: boolean = false): Promise<Keycloak.KeycloakProfile> {
    return new Promise(async (resolve, reject) => {
      if (this.userProfile && !forceReload) {
        return resolve(this.userProfile);
      }

      this.instance
        .loadUserProfile()
        .success(result => {
          this.userProfile = result as Keycloak.KeycloakProfile;
          resolve(this.userProfile);
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
   * @return {Promise<string>}
   */
  getToken(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.updateToken(10);
        resolve(this.instance.token);
      } catch (error) {
        this.login();
      }
    });
  }

  /**
   * Returns the logged username.
   * @return {string}
   */
  getUsername(): string {
    if (!this.userProfile) {
      throw new Error('User not logged in');
    }

    return this.userProfile.username!;
  }

  /**
   * Clear authentication state, including tokens. This can be useful if application
   * has detected the session was expired, for example if updating token fails.
   * Invoking this results in onAuthLogout callback listener being invoked.
   */
  clearToken(): void {
    this.instance.clearToken();
  }

  /**
   * Adds a valid token in header. The key & value format is:
   * Authorization Bearer <token>.
   * If the headers param is undefined it will create the Angular headers object.
   *
   * @param {Promise<Headers>} headers updated header with Authorization and Keycloak token.
   */
  addTokenToHeader(headersArg?: HttpHeaders): Observable<HttpHeaders> {
    return Observable.create(async (observer: Observer<any>) => {
      let headers = headersArg;
      if (!headers) {
        headers = new HttpHeaders();
      }
      try {
        const token: string = await this.getToken();
        headers = headers.set('Authorization', 'bearer ' + token);
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
   * @returns {@link Keycloak.KeycloakInstance}
   */
  getKeycloakInstance(): Keycloak.KeycloakInstance {
    return this.instance;
  }

  /**
   * Returns the excluded URLs that should not be considered by
   * the http interceptor which automatically adds the authorization header in the Http Request.
   */
  getBearerExcludedUrls(): string[] {
    return this.bearerExcludedUrls;
  }
}
