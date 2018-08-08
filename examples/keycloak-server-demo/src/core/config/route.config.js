'use-strict';

import GenericConfig from './generic.config';
import logger from './log.config';

export class RouteConfig extends GenericConfig {
  constructor() {
    super();

    this._routes = { loadedRoutes: 0, routes: {} };
    this._initialize();
  }

  async _load() {
    try {
      let files = await this.findFiles('**/*.route.js');
      const model = files.forEach(file => sequelize.import(file));
      this._db.models[model.name] = model;
      this._db.loadedModels += 1;
    } catch (error) {
      logger.warn(`There aren't models to load. Details: ${error}`);
    }
  }

  async _initialize() {
    await this._loadModels(sequelize);
    this._db.sequelize = sequelize;

    this.emit('db-initialized', this._db);
    logger.info(`DB initialization is complete. Total of models loaded: ${this._db.loadedModels}`);
  }

  get db() {
    return this._db;
  }
}
