/* jshint node: true */

module.exports = function (environment) {
  var ENV = {
    modulePrefix: 'yith-responsive-client',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    defaults: {
      clientId: '264cb197-75fd-4b38-b759-81c7750ad6dc',
      clientBaseUrl: 'http://respyith:4400',
      serverBaseUrl: 'http://localhost:6543',
      encryptOptions: {
        v:1,
        iter:100000,
        ks:128,
        ts:64,
        mode: 'ccm',
        adata: '',
        cipher: 'aes'
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    contentSecurityPolicy: {
      /* eslint-disable quotes */
      'style-src': "'self' 'unsafe-inline'",
      'connect-src': "'self' http://respyith:4400 ws://respyith:49152 http://localhost:6543",
      'img-src': "'self' data:",
      'script-src': "'self' http://respyith:49152"
      /* eslint-enable quotes */
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
    ENV.defaults.clientBaseUrl = 'https://responsive.yithlibrary.com';
    ENV.defaults.serverBaseUrl = 'https://www.yithlibrary.com';
  }

  return ENV;
};
