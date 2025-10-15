/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { Directive, effect, inject, Input, type OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import Keycloak from 'keycloak-js';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, type ReadyArgs, typeEventArgs } from '../signals/keycloak-events-signal';

/**
 * Structural directive to conditionally display elements based on Keycloak user roles.
 *
 * This directive checks if the authenticated user has at least one of the specified roles.
 * Roles can be validated against a specific **resource (client ID)** or the **realm**.
 *
 * ### Features:
 * - Supports role checking in both **resources (client-level roles)** and the **realm**.
 * - Accepts an array of roles to match.
 * - Optional configuration to check realm-level roles.
 *
 * ### Inputs:
 * - `kaHasRoles` (Required): Array of roles to validate.
 * - `resource` (Optional): The client ID or resource name to validate resource-level roles.
 * - `checkRealm` (Optional): A boolean flag to enable realm role validation (default is `false`).
 *
 * ### Requirements:
 * - A Keycloak instance must be injected via Angular's dependency injection.
 * - The user must be authenticated in Keycloak.
 *
 * @example
 * #### Example 1: Check for Global Realm Roles
 * Show the content only if the user has the `admin` or `editor` role in the realm.
 * ```html
 * <div *kaHasRoles="['admin', 'editor']; checkRealm:true">
 *   <p>This content is visible only to users with 'admin' or 'editor' realm roles.</p>
 * </div>
 * ```
 *
 * @example
 * #### Example 2: Check for Resource Roles
 * Show the content only if the user has the `read` or `write` role for a specific resource (`my-client`).
 * ```html
 * <div *kaHasRoles="['read', 'write']; resource:'my-client'">
 *   <p>This content is visible only to users with 'read' or 'write' roles for 'my-client'.</p>
 * </div>
 * ```
 *
 * @example
 * #### Example 3: Check for Both Resource and Realm Roles
 * Show the content if the user has the roles in either the realm or a resource.
 * ```html
 * <div *kaHasRoles="['admin', 'write']; resource:'my-client' checkRealm:true">
 *   <p>This content is visible to users with 'admin' in the realm or 'write' in 'my-client'.</p>
 * </div>
 * ```
 *
 * @example
 * #### Example 4: Fallback Content When Roles Do Not Match
 * Use an `<ng-template>` to display fallback content if the user lacks the required roles.
 * ```html
 * <div *kaHasRoles="['admin']; resource:'my-client'">
 *   <p>Welcome, Admin!</p>
 * </div>
 * <ng-template #noAccess>
 *   <p>Access Denied</p>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[kaHasRoles]'
})
export class HasRolesDirective implements OnChanges {
  private templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private keycloak = inject(Keycloak);

  /**
   * List of roles to validate against the resource or realm.
   */
  @Input('kaHasRoles') roles: string[] = [];

  /**
   * The resource (client ID) to validate roles against.
   */
  @Input('kaHasRolesResource') resource?: string;

  /**
   * Flag to enable realm-level role validation.
   */
  @Input('kaHasRolesCheckRealm') checkRealm: boolean = false;

  constructor() {
    this.viewContainer.clear();

    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

    /**
     * This effect will reevaluate roles after authentication or token refresh.
     * Or clear the view on logout.
     */
    effect(() => {
      const keycloakEvent = keycloakSignal();

      switch (keycloakEvent.type) {
        case KeycloakEventType.Ready: {
          const authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
          if (authenticated) {
            this.render();
          } else {
            this.viewContainer.clear();
          }
          break;
        }
        case KeycloakEventType.AuthSuccess:
        case KeycloakEventType.AuthRefreshSuccess:
        case KeycloakEventType.TokenExpired:
          this.render();
          break;
        case KeycloakEventType.AuthLogout:
          this.viewContainer.clear();
          break;
        default: 
          break;
      }
    });
  }

  /**
   * Here to reevaluate access when inputs change.
   */
  public ngOnChanges(): void {
    this.render();
  }

  /**
   * Clear the view and render it if user has access.
   */
  private render(): void {
    const hasAccess = this.checkUserRoles();
    this.viewContainer.clear();

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  /**
   * Checks if the user has at least one of the specified roles in the resource or realm.
   * @returns True if the user has access, false otherwise.
   */
  private checkUserRoles(): boolean {
    const hasResourceRole = this.roles.some((role) => this.keycloak.hasResourceRole(role, this.resource));

    const hasRealmRole = this.checkRealm ? this.roles.some((role) => this.keycloak.hasRealmRole(role)) : false;

    return hasResourceRole || hasRealmRole;
  }
}
