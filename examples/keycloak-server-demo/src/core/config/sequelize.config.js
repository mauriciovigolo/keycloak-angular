/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

module.exports = {
  development: {
    storage: ':memory:',
    dialect: 'sqlite'
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite'
  },
  production: {
    storage: ':memory:',
    dialect: 'sqlite'
  }
};
