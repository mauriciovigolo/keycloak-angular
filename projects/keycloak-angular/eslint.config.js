// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config');

module.exports = tseslint.config(...rootConfig, {
  files: ['**/*.ts'],
  rules: {
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        prefix: 'ka',
        style: 'camelCase'
      }
    ],
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        prefix: 'ka',
        style: 'kebab-case'
      }
    ]
  }
});
