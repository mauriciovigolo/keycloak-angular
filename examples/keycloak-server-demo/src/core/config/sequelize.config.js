'use-strict';

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
