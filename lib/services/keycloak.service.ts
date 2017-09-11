import * as Keycloak from 'keycloak-js';
import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { KeycloakConfig, KeycloakOptions } from '../interfaces';

/**
 * @description Service to expose existant methods from the Keycloak JS adapter, adding new 
 * functionalities to improve the use of keycloak in Angular 4 applications.
 * 
 * This class should be inject in the application bootstrap, so the same instance will be used
 * along the web application.
 * 
 * @class
 */
@Injectable()
export class KeycloakAngular {
  private userProfile: Keycloak.KeycloakProfile;
  private keycloak: Keycloak.KeycloakInstance;

  constructor(options: KeycloakOptions) {
    this.init(options);
  }

  /**
   * @description Keycloak initialization. It should be called to initialize the adapter.
   * Options is a object with 2 main parameters: config and initOptions. The first one
   * will be used to create the Keycloak instance. The second one are options to initialize the 
   * keycloak instance.
   * 
   * @param {KeycloakOptions} options 
   * config: may be a string representing the keycloak URI or an object with the 
   * following content:
   * - url (meaning the Keycloak URL);
   * - realm: ();
   * - clientId?: string;
   * 
   * initOptions: 
   * - onLoad - Specifies an action to do on load. Supported values are 'login-required' or 
   * 'check-sso'.
   * - token - Set an initial value for the token.
   * - refreshToken - Set an initial value for the refresh token.
   * - idToken - Set an initial value for the id token (only together with token or refreshToken).
   * - timeSkew - Set an initial value for skew between local time and Keycloak server in seconds 
   * (only together with token or refreshToken).
   * - checkLoginIframe - Set to enable/disable monitoring login state (default is true).
   * - checkLoginIframeInterval - Set the interval to check login state (default is 5 seconds).
   * - responseMode - Set the OpenID Connect response mode send to Keycloak server at login 
   * request. Valid values are query or fragment . Default value is fragment, which means 
   * that after successful authentication will Keycloak redirect to javascript application 
   * with OpenID Connect parameters added in URL fragment. This is generally safer and 
   * recommended over query.
   * - flow - Set the OpenID Connect flow. Valid values are standard, implicit or hybrid.
   * @return {Promise<void>}
   */
  init(options: KeycloakOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let url: string;
      let realm: string | undefined = undefined;
      let clientId: string | undefined = undefined;

      if (typeof options.config === 'string') {
        url = options.config;
      } else {
        url = options.config.url;
        realm = options.config.realm;
        clientId = options.config.clientId;
      }

      const config: KeycloakConfig = {
        url,
        realm,
        clientId
      };

      this.keycloak = Keycloak(config);

      const initParams: Keycloak.KeycloakInitOptions = options.initOptions || {};
      try {
        await this.keycloak.init(initParams);
        resolve();
      } catch (e) {
        reject('An error happened during Keycloak initialization. Details: ' + e);
      }
    });
  }

  /**
   * @description Redirects to login form on (options is an optional object with redirectUri and/or 
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
   *  - action: If value is 'register' then user is redirected to registration page, otherwise to login page.
   *  - locale: Specifies the desired locale for the UI.
   */
  login(options: Keycloak.KeycloakLoginOptions = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.keycloak.login(options);
        resolve();
      } catch (error) {
        reject('An error happened during the login execution. Details' + error);
      }
    });
  }

  /**
   * @description Redirects to logout.
   *
   * @param {string} redirectUri Specifies the uri to redirect to after logout.
   */
  logout(redirectUri?: string) {
    return new Promise(async (resolve, reject) => {
      const options: any = {
        redirectUri: redirectUri
      };
      try {
        await this.keycloak.logout(options);
        resolve();
      } catch (error) {
        reject('An error happened during the register execution. Details' + error);
      }
    });    
  }

  /**
   * @description Redirects to registration form. Shortcut for login with option 
   * action = 'register'. Options are same as for the login method but 'action' is set to 
   * 'register'.
   * 
   * @param {Keycloak.KeycloakLoginOptions} options login options
   */
  register(options: Keycloak.KeycloakLoginOptions = { action: 'register' }): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.keycloak.register(options);
        resolve();
      } catch (error) {
        reject('An error happened during the register execution. Details' + error);
      }
    });
  }

  /**
   * @description Check if the user has access to the specified role. It will look for roles in 
   * realm and clientId.
   * 
   * @param {string} role - role name
   * @return {boolean}
   */
  isUserInRole(role: string): boolean {
    let hasRole: boolean;
    hasRole = this.keycloak.hasResourceRole(role);
    if (!hasRole) {
      hasRole = this.keycloak.hasRealmRole(role);
    }
    this.keycloak.profile;
    return hasRole;
  }

  /**
   * @description Return the roles of the logged user. The default with allRoles set to false 
   * (default value) will return only the user roles associated with the clientId. If allRoles is 
   * true it will return the clientId and realm roles associated with the logged user.
   * 
   * @param {boolean} allRoles - flag to set if all roles should be returned.(Optional: default value 
   * is false)
   * @return {string[]} - roles list associated with the logged user.
   */
  getUserRoles(allRoles: boolean = false): string[] {
    let roles: string[];
    roles = this.keycloak.resourceAccess || [];
    if (allRoles) {
      roles = roles.concat(this.keycloak.realmAccess ? this.keycloak.realmAccess.roles : []);
    }
    return roles;
  }

  /**
   * @description Check if user is logged in.
   * 
   * @return {boolean}
   */
  isLoggedIn(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let loggedIn = await this.updateToken(20);
      resolve(loggedIn);
    });
  }

  /**
   * @description Returns true if the token has less than minValidity seconds left before 
   * it expires.
   * 
   * @param {number} minValidity seconds left. (minValidity) is optional. Default value is 0.
   * @return {boolean}
   */
  isTokenExpired(minValidity: number = 0): boolean {
    return this.keycloak.isTokenExpired(minValidity);
  }

  /**
   * @description If the token expires within minValidity seconds the token is refreshed. If the 
   * session status iframe is enabled, the session status is also checked.
   * Returns promise to set functions that can be invoked if the token is still valid, or if the
   * token is no longer valid.
   * 
   * @param {number} minValidity - seconds left. (minValidity is optional, if not specified 5 is used)
   * @return {Promise<boolean>}
   */
  updateToken(minValidity: number = 5): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let refreshed: boolean;
      try {
        refreshed = !!await this.keycloak.updateToken(minValidity);
        resolve(refreshed);
      } catch (error) {
        reject(false);
      }
    });
  }

  /**
   * @description Loads the users profile.
   * Returns promise to set functions to be invoked if the profile was loaded successfully, or if 
   * the profile could not be loaded.
   * 
   * @return {Promise<Keycloak.KeycloakProfile>}
   */
  loadUserProfile(): Promise<Keycloak.KeycloakProfile> {
    return new Promise(async (resolve, reject) => {
      let userProfile: Keycloak.KeycloakProfile;
      try {
        let result: any = await this.keycloak.loadUserProfile();
        if (result) {
          userProfile = result as Keycloak.KeycloakProfile;
          resolve(userProfile);
        } else {
          reject("Can't get the user profile.");
        }
      } catch (error) {
        reject("Can't get the user profile. Details: " + error);
      }
    });
  }

  /**
   * @description Returns the authenticated token, calling updateToken to get a refreshed one if 
   * necessary. If the session is expired this method calls the login method for a new login.
   * 
   * @return {Promise<string>}
   */
  getToken(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let tokenUpdated: boolean;
      try {
        tokenUpdated = !!await this.updateToken(10);
      } catch (error) {
        tokenUpdated = false;
      }
      if (!tokenUpdated) {
        this.login();
      }
      resolve(this.keycloak.token);
    });
  }

  /**
   * @description Clear authentication state, including tokens. This can be useful if application 
   * has detected the session was expired, for example if updating token fails.
   * Invoking this results in onAuthLogout callback listener being invoked.
   */
  clearToken(): void {
    this.keycloak.clearToken();
  }

  /**
   * @description Adds a valid token in header. The key & value format is: 
   * Authorization Bearer <token>.
   * If the headers param is undefined it will create the Angular headers object.
   * 
   * @param {Promise<Headers>} headers updated header with Authorization and Keycloak token.
   */
  addTokenToHeader(headers?: Headers): Promise<Headers> {
    return new Promise(async (resolve, reject) => {
      if (!headers) {
        headers = new Headers();
      }
      headers.append('Authorization', 'Bearer ' + (await this.getToken()));
      resolve(headers);
    });
  }
}
