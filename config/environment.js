/* jshint node: true */

module.exports = function (environment) {
  var ENV = {
    modulePrefix: 'yith-responsive-client',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    defaults: {
      clientId: 'c6de3a0b-4134-454e-8688-26a2bb150293',
      clientBaseUrl: 'http://localhost:4200',
      serverBaseUrl: 'http://localhost:6544'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.defaults.clientId = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    ENV.defaults.clientBaseUrl = 'https://yithlibrary-mobileclient.herokuapp.com';
    ENV.defaults.serverBaseUrl = 'https://yithlibrary.herokuapp.com';
  }

  return ENV;
};
