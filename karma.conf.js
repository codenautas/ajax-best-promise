"use strict";
// Karma configuration
// Generated on Wed Jul 22 2015 16:41:45 GMT-0300 (Hora estándar de Argentina)

module.exports = function(config, preConfig) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    browserNoActivityTimeout: 40000,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha','expect'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/es6-promise/dist/es6-promise.min.js',
      'node_modules/require-bro/lib/polyfills-bro.js',
      'node_modules/express-useragent/lib/express-useragent.js',
      'bin/*.js',
      'test/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'bin/*.js': preConfig.singleRun?['coverage']:[] /* COMENTAR PARA VER MÁS LIMPIO EL CÓDIGO */,
    },
    coverageReporter: process.env.TRAVIS?{type:'lcov'}:{
      type : 'html',
      dir : 'coverage/'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,

    crossOriginAttribute: false, 

    customHeaders: [
      {match: '.*', name: 'Service-Worker-Allowed', value: '/'},
      {match: '.*', name: 'Access-Control-Allow-Origin', value: '*'},
      {match: '.*', name: 'Access-Control-Allow-Credentials', value: 'true'},
      {match: '.*', name: 'Access-Control-Allow-Methods', value: 'GET,HEAD,OPTIONS,POST,PUT'},
      {match: '.*', name: 'Access-Control-Allow-Headers', value: 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, mirror'},
    ],

    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'].concat((process.env.TRAVIS?[]:['Chrome'])),
    /* NO CAMBIAR MÁS BROWSERS DIRECTO DESDE ACÁ, INVOCAR DESDE LA LÍNEA DE PARÁMETROS ASÍ:
    npm run infinito -- --browsers Chrome
    npm run infinito -- --browsers Firefox,Chrome
    npm run infinito -- --browsers Firefox,Chrome,IE
    */

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !!process.env.TRAVIS
  });
};
