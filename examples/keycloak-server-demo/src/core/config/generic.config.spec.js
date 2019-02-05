/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { GenericConfig } from './generic.config';

describe('=> GenericConfig', () => {
  let genericConfig;

  beforeAll(() => {
    genericConfig = new GenericConfig();
  });

  describe('#constructor', () => {
    it('Should be initialized', () => {
      expect(genericConfig).toBeDefined();
    });
  });

  describe('#_findFiles', () => {
    it('Should find route files', async () => {
      let files = await genericConfig._findFiles('**/*.route.js');
      expect(files.length).toBeGreaterThan(0);
    });
  });
});
