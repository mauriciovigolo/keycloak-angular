'use-strict';

import { GenericConfig } from './generic.config';
import logger from './log.config';

export class RouterConfig extends GenericConfig {
  constructor(app) {
    super();

    this.app = app;
    this._routers = { loadedRouters: 0, routers: [] };
    this._initialize();
  }

  _loadRouter(file) {}

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
      `Router initialization is complete. Total of loaded routers: ${this._routers.loadedRoutes}`
    );
  }

  get routers() {
    return this._routers;
  }
}
