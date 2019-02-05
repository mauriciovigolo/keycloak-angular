/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import Sequelize from 'sequelize';

import { GenericConfig } from './generic.config';
import { logger } from './log.config';

class DatabaseConfig extends GenericConfig {
  constructor() {
    super();

    this._db = { loadedModels: 0, sequelize: undefined, models: [] };
    this._initialize();
  }

  async _loadModels(sequelize) {
    try {
      let files = await this._findFiles('**/*.model.js');
      const models = files.map(file => sequelize.import(file));
      this._db.models = models;
      this._db.loadedModels = models.length;
    } catch (error) {
      logger.warn(`There aren't models to load. Details: ${error}`);
    }
  }

  async _initialize() {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:'
    });

    await this._loadModels(sequelize);
    this._db.sequelize = sequelize;

    this.emit('db-initialized', this._db);
    logger.info(
      `DB initialization is complete. Total of models loaded: ${
        this._db.loadedModels
      }`
    );
  }

  get db() {
    return this._db;
  }
}

const databaseConfig = new DatabaseConfig();
module.exports = databaseConfig;
