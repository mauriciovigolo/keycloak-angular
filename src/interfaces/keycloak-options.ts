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
   * String Array to exclude the urls that should not have the Authorization Header automatically
   * added. This library makes use of Angular Http Interceptor, to automatically add the Bearer
   * token to the request.
   */
  bearerExcludedUrls?: string[];
  /**
   * String Array to exclude the urls that should not have the Authorization Header automatically
   * added. This library makes use of Angular Http Interceptor, to automatically add the RPT
   * token to the request. Here you should exclude urls which do not go to your resource server.
   */
  rptExcludedUrls?: string[];
  /**
   * If true, the KeycloakAuthorization is initialized and KeycloakRptInterceptor is activated.
   * Default is false.
   */
  enableAuthorization?: boolean;
  /**
   * Object with following optional keys: permissions, ticket, submitRequest, metadata, incrementalAuthorization.
   * Server as a template for an Authroization Request consumed by functions
   * KeycloakAuthorizationInstance.authorize() and KeycloakAuthorizationInstance.entitlement().
   */
  authorizationRequestTemplate?: {
    permissions?: any;
    ticket?: any;
    submitRequest?: any;
    metadata?: any;
    incrementalAuthorization?: any;
  };
  /**
   * String "uma" or "entitlement" specifies, which function of the two functions
   * KeycloakAuthorizationInstance.authorize() or KeycloakAuthorizationInstance.entitlement()
   * will be used to obtain RPT. When not set, UMA is used.
   */
  resourceServerAuthorizationType?: string;
  /**
   * Resource server ID, only needed when resourceServerAuthorizationType is set to "entitlement";
   */
  resourceServerID?: string;
}
