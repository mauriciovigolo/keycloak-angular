/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import session from 'express-session';
import Keycloak from 'keycloak-connect';

const keycloakConfig = {
  bearerOnly: true,
  clientId: 'keycloak-heroes-api',
  serverUrl: 'http://localhost:8080/auth',
  realm: 'keycloak-angular'
};

let keycloak;

export const initKeycloak = app => {
  const memoryStore = new session.MemoryStore();
  keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

  app.use(keycloak.middleware());
};

export const authenticated = () => {
  return keycloak.protect();
};

export const roleAllowed = (roleAllowed = '') => {
  return keycloak.protect(roleAllowed);
};
