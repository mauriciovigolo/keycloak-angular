/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { FileCrawlerConfig } from './file-crawler.config';

describe('FileCrawlerConfig', () => {
  let fileCrawlerConfig;

  beforeEach(() => {
    fileCrawlerConfig = new FileCrawlerConfig();
  });

  it('Should be initialized', () => {
    expect(fileCrawlerConfig).toBeDefined();
  });

  it('Should find route files', async () => {
    let files = await fileCrawlerConfig._findFiles('**/*.route.js');
    expect(files.length).toBeGreaterThan(0);
  });
});
