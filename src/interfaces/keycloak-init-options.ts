/**
 * Keycloak onload options: 'login-required' or 'check-sso'
 */
export type KeycloakOnLoad = 'login-required' | 'check-sso';
/**
 * Keycloak response mode options: 'query' or 'fragment'
 */
export type KeycloakResponseMode = 'query' | 'fragment';
/**
 * Keycloak response type options: 'code' or 'id_token token' or 'code id_token token'
 */
export type KeycloakResponseType = 'code' | 'id_token token' | 'code id_token token';
/**
 * Keycloak flow: 'standard' or 'implicit' or 'hybrid'
 */
export type KeycloakFlow = 'standard' | 'implicit' | 'hybrid';

/**
 * Definitions file from KeycloakInitOptions, from keycloak-js library.
 */
export interface KeycloakInitOptions {
  /**
   * Specifies an action to do on load.
   */
  onLoad?: KeycloakOnLoad;
  /**
   * Set an initial value for the token.
   */
  token?: string;
  /**
   * Set an initial value for the refresh token.
   */
  refreshToken?: string;
  /**
   * Set an initial value for the id token (only together with `token` or
   * `refreshToken`).
   */
  idToken?: string;
  /**
   * Set an initial value for skew between local time and Keycloak server in
   * seconds (only together with `token` or `refreshToken`).
   */
  timeSkew?: number;
  /**
   * Set to enable/disable monitoring login state.
   * @default true
   */
  checkLoginIframe?: boolean;
  /**
   * Set the interval to check login state (in seconds).
   * @default 5
   */
  checkLoginIframeInterval?: boolean;
  /**
   * Set the OpenID Connect response mode to send to Keycloak upon login.
   * @default fragment After successful authentication Keycloak will redirect
   *                   to JavaScript application with OpenID Connect parameters
   *                   added in URL fragment. This is generally safer and
   *                   recommended over query.
   */
  responseMode?: KeycloakResponseMode;
  /**
   * Set the OpenID Connect flow.
   * @default standard
   */
  flow?: KeycloakFlow;
}
