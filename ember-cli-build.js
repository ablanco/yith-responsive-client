/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        // Any other options
    });

    // Use `app.import` to add additional libraries to the generated
    // output files.
    //
    // If you need to use different assets in different
    // environments, specify an object as the first parameter. That
    // object's keys should be the environment name and the values
    // should be the asset to use in that environment.
    //
    // If the library that you are including contains AMD or ES6
    // modules that you would like to import into your application
    // please specify an object with the list of modules as keys
    // along with the exports of each module as its value.

    app.import('bower_components/sjcl/sjcl.js');
    app.import('bower_components/bootstrap/dist/js/bootstrap.js');
    app.import('bower_components/flat-ui/dist/js/flat-ui.js');
    app.import('bower_components/pwstrength-bootstrap/dist/pwstrength-bootstrap-1.2.7.js');

    app.import('bower_components/bootstrap/dist/css/bootstrap.css');
    app.import('bower_components/flat-ui/dist/css/flat-ui.css');

    app.import('bower_components/flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.woff', {
        destDir: 'fonts/glyphicons'
    });
    app.import('bower_components/flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.svg', {
        destDir: 'fonts/glyphicons'
    });
    app.import('bower_components/flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.ttf', {
        destDir: 'fonts/glyphicons'
    });
    app.import('bower_components/flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.eot', {
        destDir: 'fonts/glyphicons'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-black.woff', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-black.svg', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-black.ttf', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-black.eot', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bold.woff', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bold.svg', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bold.ttf', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bold.eot', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bolditalic.woff', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bolditalic.svg', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bolditalic.ttf', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-bolditalic.eot', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-italic.woff', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-italic.svg', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-italic.ttf', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-italic.eot', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-light.woff', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-light.svg', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-light.ttf', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-light.eot', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-regular.woff', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-regular.svg', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-regular.ttf', {
        destDir: 'fonts/lato'
    });
    app.import('bower_components/flat-ui/dist/fonts/lato/lato-regular.eot', {
        destDir: 'fonts/lato'
    });

    app.import('bower_components/fira/eot/FiraMono-Regular.eot', {
        destDir: 'fonts/fira'
    });
    app.import('bower_components/fira/woff/FiraMono-Regular.woff', {
        destDir: 'fonts/fira'
    });
    app.import('bower_components/fira/ttf/FiraMono-Regular.ttf', {
        destDir: 'fonts/fira'
    });

    return app.toTree();
};
