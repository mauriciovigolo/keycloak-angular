const Sequelize = require('sequelize');
const EventEmitter = require('events');
const { FileMatcher, FindOptions } = require('file-matcher');

const logger = require('./log.config');

class DatabaseConfig extends EventEmitter {}

const db = { loadedModels: 0 };

const findModels = async () => {
  let options = {
    path: __dirname,
    recursiveSearch: true,
    fileFilter: {
      fileNamePattern: '**/*.model.js'
    }
  };

  let fileMatcher = new FileMatcher();
  return await fileMatcher.find(options);
};

const loadModels = async sequelize => {
  let files;
  try {
    files = await findModels();
    const model = files.forEach(file => sequelize.import(file));
    db[model.name] = model;
    db.loadedModels += 1;
  } catch (error) {
    logger.warn(`There aren't models to load. Details: ${error}`);
  }
};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:'
});

loadModels(sequelize).then(() => {
  db.sequelize = sequelize;
  logger.info(`DB initialization is complete. Total of models loaded: ${db.loadedModels}`);
});

module.exports = db;
