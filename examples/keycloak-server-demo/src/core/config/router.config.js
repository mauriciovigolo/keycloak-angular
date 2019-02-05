/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { GenericConfig } from './generic.config';
import { logger } from './log.config';

export class RouterConfig extends GenericConfig {
  constructor(app) {
    super();

    this.app = app;
    this._routers = { loadedRouters: 0, routers: [] };
    this._initialize();
  }

  _loadRouter(file) {
    const { router, path } = require(file);
    if (router) {
      this.app.use(path, router);

      this._routers.loadedRouters += 1;
      this._routers.routers.push({ router, path });
    }
  }

  async _load() {
    try {
      let files = await this._findFiles('**/*.router.js');
      files.forEach(file => this._loadRouter(file));
    } catch (error) {
      logger.warn(`There aren't routers to load. Details: ${error}`);
    }
  }

  async _initialize() {
    await this._load();

    this.emit('routers-initialized', this._routers);

    logger.info(
      `Router initialization is complete. Total of loaded routers: ${
        this._routers.loadedRouters
      }`
    );
  }

  get routers() {
    return this._routers;
  }
}
