/**
* @license
* Copyright Mauricio Gemelli Vigolo.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from './';

/**
 * @class
 * @description A simple guard implementation out of the box. This class should be inherited and 
 * implemented by the application. The only method that should be implemented is #isAccessAllowed.
 * The reason for this is that the authorization flow is usually not unique, so in this way you will
 * have more freedom to customize your authorization flow.
 * 
 * @property authenticated: boolean that indicates if the user is authenticated or not.
 * @property roles: roles of the logged user. It contains the clientId and realm user roles.
 */
export abstract class KeycloakAuthGuard implements CanActivate {
  protected authenticated: boolean;
  protected roles: string[];

  constructor(protected router: Router, protected keycloakAngular: KeycloakService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        this.authenticated = await this.keycloakAngular.isLoggedIn();
        this.roles = await this.keycloakAngular.getUserRoles(true);

        const result = await this.isAccessAllowed(route, state);
        resolve(result);
      } catch (error) {
        reject('An error happened during access validation. Details:' + error);
      }
    });
  }

  /**
   * Create your own customized authorization flow in this method. From here you already known 
   * if the user is authenticated (this.authenticated) and the user roles (this.roles).
   * 
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   */
  abstract isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean>;
}
