// Karma configuration
// Generated on Tue Oct 03 2017 14:59:07 GMT-0300 (Hora oficial do Brasil)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      'init-test.spec.ts',
      'index.ts',
      'src/**/*.ts',
      'test/**/*.ts'
    ],
    exclude: [
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/,
        transforms: [
        ]
      },
      compilerOptions: {
        lib: ['ES2015', 'DOM']
      },
      reports: {
        lcovonly: {
          directory: 'coverage',
          subdirectory: 'lcov',
          filename: 'lcov.info'
        },
        html: {
          directory: 'coverage',
          subdirectory: 'html-report'
        }
      }
    },
    browserNoActivityTimeout: 100000,    
    reporters: ['progress', 'karma-typescript'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity 
  })
}
