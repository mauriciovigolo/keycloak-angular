// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../../eslint.config');

module.exports = tseslint.config(...rootConfig, {
  files: ['**/*.ts'],
  rules: {
    '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    '@angular-eslint/prefer-standalone': 'off',
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        prefix: 'app',
        style: 'camelCase'
      }
    ],
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        prefix: 'app',
        style: 'kebab-case'
      }
    ]
  }
});
