"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('yith-responsive-client/adapters/application', ['exports', 'ember-data', 'yith-responsive-client/config/environment'], function (exports, DS, ENV) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = DS['default'].RESTAdapter.extend({
        host: ENV['default'].defaults.serverBaseUrl,

        ajax: function ajax(url, type, hash) {
            // Prepare the adapter for the oAuth stuff
            url += "?client_id=" + this.settings.getSetting('clientId');
            if (hash === undefined) {
                hash = {};
            }
            hash.crossDomain = true;
            this.authManager.loadToken();
            hash.headers = {
                "Authorization": "Bearer " + this.authManager.get('accessToken')
            };
            return this._super(url, type, hash);
        },

        didError: function didError() {
            console.error(arguments);
        }
    });

});
define('yith-responsive-client/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'yith-responsive-client/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    var App;

    Ember['default'].MODEL_FACTORY_INJECTIONS = true;

    App = Ember['default'].Application.extend({
        modulePrefix: config['default'].modulePrefix,
        podModulePrefix: config['default'].podModulePrefix,
        Resolver: Resolver['default']
    });

    loadInitializers['default'](App, config['default'].modulePrefix);

    exports['default'] = App;

});
define('yith-responsive-client/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'yith-responsive-client/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
define('yith-responsive-client/components/ask-confirmation', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Component.extend({
        click: function click(evt) {
            var $target = Ember['default'].$(evt.target);

            if ($target.is('.ask-confirmation')) {
                Ember['default'].$('.ask-confirmation-modal').modal({ show: false }).modal('show');
            } else if ($target.is('.ask-confirmation-modal .confirm')) {
                Ember['default'].$('.ask-confirmation-modal').modal('hide');
                this.sendAction('action');
            }
        }
    });

});
define('yith-responsive-client/components/ask-master-password', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    /* global sjcl */

    exports['default'] = Ember['default'].Component.extend({
        errorMessage: '',

        showModal: Ember['default'].observer('flag', function () {
            var that = this,
                $modal;

            if (this.get('flag')) {
                this.set('masterPassword', '');
                $modal = Ember['default'].$('#master-password-modal').modal({
                    show: false
                });
                $modal.off('hidden.bs.modal').on('hidden.bs.modal', function () {
                    that.set('flag', false);
                });
                $modal.off('shown.bs.modal').on('shown.bs.modal', function () {
                    $modal.find('input').focus();
                });
                $modal.modal('show');
            }
        }),

        actions: {
            sendToController: function sendToController() {
                var testPassword = this.get('testPassword');

                if (!Ember['default'].isNone(testPassword)) {
                    try {
                        sjcl.decrypt(this.get('masterPassword'), testPassword.get('secret'));
                    } catch (err) {
                        this.set('errorMessage', 'Wrong master password');
                        Ember['default'].$('#master-password-modal input').select();
                        return;
                    }
                }
                this.set('errorMessage', '');

                Ember['default'].$('#master-password-modal').modal('hide');
                this.sendAction('action', this.get('masterPassword'));
            }
        }
    });

});
define('yith-responsive-client/components/edit-password-field', ['exports', 'ember', 'yith-responsive-client/utils/passwordGenerator'], function (exports, Ember, _generatePassword) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Component.extend({
        pwstrengthOptions: {
            rules: {
                activated: {
                    wordTwoCharacterClasses: true,
                    wordRepetitions: true
                }
            },
            ui: {
                showVerdictsInsideProgressBar: true,
                container: '#password-edit-field',
                viewports: {
                    progress: '#password-strength-meter'
                }
            }
        },

        didInsertElement: function didInsertElement() {
            Ember['default'].$('input[name="password1"]').pwstrength(this.pwstrengthOptions);
        },

        invalid: false,

        inputType: 'password',

        validate: Ember['default'].observer('password1', 'password2', function () {
            var password = this.get('password1'),
                same = password === this.get('password2');

            if (!same) {
                this.set('invalid', true);
            } else {
                this.set('invalid', false);
                this.sendAction('action', password);
            }
        }),

        showGeneratorOptions: false,

        passGenLength: Ember['default'].computed('settings', {
            get: function get() {
                return this.get('settings').getSetting('passGenLength');
            },
            set: function set(key, value) {
                this.get('settings').setSetting(key, parseInt(value, 10));
            }
        }),

        updatePassGenOption: function updatePassGenOption(name) {
            var settings = this.get('settings');

            settings.setSetting(name, !settings.getSetting(name));
            this.notifyPropertyChange('settings');
            this.recreatePassGenCheckboxes();
        },

        recreatePassGenCheckboxes: function recreatePassGenCheckboxes() {
            var settings = this.get('settings'),
                that = this;

            Ember['default'].$('.pass-gen-checkboxes label.checkbox input').radiocheck('destroy');
            Ember['default'].$('.pass-gen-checkboxes label.checkbox input').remove();

            ['passGenUseChars', 'passGenUseNumbers', 'passGenUseSymbols'].forEach(function (name) {
                var value = settings.getSetting(name),
                    action = value ? 'check' : 'uncheck',
                    input = '<input type="checkbox">';

                Ember['default'].$('label.' + name).prepend(input);
                Ember['default'].$('label.' + name + ' input').radiocheck();
                Ember['default'].$('label.' + name + ' input').radiocheck(action);
                Ember['default'].$('label.' + name + ' input').on('change', function () {
                    that.updatePassGenOption(name);
                });
            });
        },

        actions: {
            showOptions: function showOptions() {
                var that = this;

                this.set('showGeneratorOptions', true);
                Ember['default'].run.scheduleOnce('afterRender', this, function () {
                    that.recreatePassGenCheckboxes();
                });
            },

            generatePassword: function generatePassword() {
                var settings = this.get('settings'),
                    password = _generatePassword['default'](settings);

                this.set('password1', password);
                this.set('password2', password);
                password = null;
                Ember['default'].run.scheduleOnce('afterRender', this, function () {
                    Ember['default'].$('input[name=password1]').trigger('keyup');
                });
            },

            previewPassword: function previewPassword() {
                var currentInput = this.get('inputType'),
                    newInput;

                if (currentInput === 'text') {
                    newInput = 'password';
                } else {
                    newInput = 'text';
                }

                this.set('inputType', newInput);
            }
        }
    });

});
define('yith-responsive-client/components/password-viewer-countdown', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Component.extend({
        isBeingShown: false,

        // TODO use clipboard.js

        renderPassword: function renderPassword(secret) {
            this.set('passwordPlain', secret);
            this.set('countdown', 5);
            this.set('isBeingShown', true);

            var that = this,
                callback;

            callback = function () {
                var countdown = that.get('countdown');

                if (countdown > 0) {
                    that.set('countdown', countdown - 1);
                    window.setTimeout(callback, 1000);
                } else {
                    that.set('passwordPlain', '');
                    that.set('isBeingShown', false);
                }
            };
            window.setTimeout(callback, 1000);
            Ember['default'].run.scheduleOnce('afterRender', this, function () {
                that.$('input').select();
            });
        },

        actions: {
            showPassword: function showPassword() {
                var that = this;

                this.sendAction('action', this.get('password.secret'), function () {
                    that.renderPassword.apply(that, arguments);
                });
            }
        }
    });

});
define('yith-responsive-client/components/tags-input', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Component.extend({
        tagsAsString: Ember['default'].computed('tags', function () {
            if (Ember['default'].isEmpty(this.get('tags'))) {
                return '';
            }
            return this.get('tags').join(', ');
        }),

        didInsertElement: function didInsertElement() {
            var $el = this.$('input'),
                that = this;

            $el.tagsinput();
            $el.on('itemAdded', function (evt) {
                var tags = [];
                if (!Ember['default'].isEmpty(that.get('tags'))) {
                    tags = that.get('tags').copy();
                }
                tags.push(evt.item.trim());
                that.set('tags', tags);
                that.sendAction('action', tags);
            });
            $el.on('itemRemoved', function (evt) {
                // We are removing so there should already be tags
                var tags = that.get('tags').copy();
                tags = tags.without(evt.item.trim());
                that.set('tags', tags);
                that.sendAction('action', tags);
            });
        }
    });

});
define('yith-responsive-client/components/togglable-label', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Component.extend({
        status: false,

        statusClass: Ember['default'].computed('status', function () {
            if (this.get('status')) {
                return 'active';
            }
            return 'inactive';
        }),

        actions: {
            toggle: function toggle() {
                this.set('status', !this.get('status'));
                this.sendAction('action', this.get('text'));
            }
        }
    });

});
define('yith-responsive-client/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('yith-responsive-client/controllers/authorize', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('yith-responsive-client/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('yith-responsive-client/controllers/passwords/edit', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    /* global sjcl */

    exports['default'] = Ember['default'].Controller.extend({
        errorMessage: '',

        notReadyToSave: Ember['default'].computed('wantsToModifyPassword', 'tempPassword', function () {
            if (this.get('wantsToModifyPassword')) {
                return Ember['default'].isEmpty(this.get('tempPassword'));
            }
            return false;
        }),

        completeSave: function completeSave(masterPassword) {
            var that = this,
                withSecret,
                reference,
                ciphered;

            withSecret = this.get('allPasswords').filter(function (password) {
                return password.get('secret.length') > 0;
            });

            if (withSecret.get('length') > 0) {
                reference = withSecret.get('firstObject.secret');
                try {
                    sjcl.decrypt(masterPassword, reference);
                } catch (err) {
                    this.set('errorMessage', 'Wrong master password');
                    return;
                }
            }

            try {
                ciphered = sjcl.encrypt(masterPassword, this.get('tempPassword'), this.settings.getSetting('encryptOptions'));
            } catch (err) {
                this.set('errorMessage', 'Unknown error encrypting your ' + 'password, please try again later');
                return;
            }
            this.set('model.modification', new Date());
            this.set('model.secret', ciphered);
            masterPassword = null;

            this.get('model').save().then(function () {
                that.transitionToRoute('passwords.index');
            });
        },

        actions: {
            updatePassword: function updatePassword(newPassword) {
                this.set('tempPassword', newPassword);
            },

            updateTags: function updateTags(newTags) {
                this.set('tags', newTags);
            },

            letsModifyPassword: function letsModifyPassword() {
                this.set('wantsToModifyPassword', true);
            },

            sendMasterPassword: function sendMasterPassword(masterPassword) {
                this.set('requestMasterPassword', false);
                // TODO save temporal copy of the masterPassword if necessary
                this.completeSave(masterPassword);
            },

            save: function save() {
                var that = this;

                if (this.get('wantsToModifyPassword')) {
                    this.set('requestMasterPassword', true);
                    return;
                }
                this.get('model').save().then(function () {
                    that.transitionToRoute('passwords.index');
                })['catch'](function () {
                    this.set('errorMessage', 'Unknown error saving your password');
                });
            },

            'delete': function _delete() {
                var that = this;

                this.get('model').destroyRecord().then(function () {
                    that.transitionToRoute('passwords.index');
                });
            }
        }
    });

});
define('yith-responsive-client/controllers/passwords/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    /* global sjcl */

    exports['default'] = Ember['default'].Controller.extend({
        allTags: Ember['default'].computed('model.@each.tags', function () {
            var allTags = [];
            this.get('model').forEach(function (password) {
                var tags = password.get('tags');
                allTags = allTags.concat(tags);
            });
            return allTags.uniq();
        }),

        completeDecipher: function completeDecipher(masterPassword) {
            var data = this.get('passwordToDecipherData'),
                secret;

            try {
                secret = sjcl.decrypt(masterPassword, data.password);
            } catch (err) {
                this.set('errorMessage', 'Wrong master password');
                return;
            }
            masterPassword = null;
            data.callback(secret);
        },

        filteredPasswords: Ember['default'].computed('searchText', 'activeTags', 'model', function () {
            var passwords = this.get('model'),
                activeTags = this.get('activeTags'),
                searchText = this.get('searchText').toLowerCase();

            if (activeTags.length === 0 && searchText.length === 0) {
                return passwords;
            }

            return passwords.filter(function (password) {
                var include = false,
                    tags = password.get('tags'),
                    service = password.get('service').toLowerCase(),
                    account = password.get('account').toLowerCase(),
                    notes = password.get('notes').toLowerCase();

                if (activeTags.length > 0) {
                    include = include || tags.any(function (text) {
                        return activeTags.contains(text);
                    });
                }

                if (!include && searchText.length > 0) {
                    if (!Ember['default'].isNone(service)) {
                        include = include || service.indexOf(searchText) >= 0;
                    }
                    if (!Ember['default'].isNone(account)) {
                        include = include || account.indexOf(searchText) >= 0;
                    }
                    if (!Ember['default'].isNone(notes)) {
                        include = include || notes.indexOf(searchText) >= 0;
                    }
                }

                return include;
            });
        }),

        onePassword: Ember['default'].computed('model.[]', function () {
            return this.get('model.firstObject');
        }),

        actions: {
            toggleTag: function toggleTag(text) {
                var activeTags = this.get('activeTags'),
                    remove = activeTags.contains(text);

                if (remove) {
                    this.set('activeTags', activeTags.without(text));
                } else {
                    activeTags.push(text);
                    this.set('activeTags', activeTags.uniq());
                }
            },

            decipher: function decipher(password, callback) {
                this.set('passwordToDecipherData', {
                    password: password,
                    callback: callback
                });
                // TODO
                // 1. Check if the masterPassword is in memory
                // 2. If not, ask for it
                this.set('requestMasterPassword', true);
                // 3. Decipher password
            },

            sendMasterPassword: function sendMasterPassword(masterPassword) {
                this.set('requestMasterPassword', false);
                // TODO save temporal copy of the masterPassword if necessary
                this.completeDecipher(masterPassword);
            }
        }
    });

});
define('yith-responsive-client/controllers/passwords/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    /* global sjcl */

    exports['default'] = Ember['default'].Controller.extend({
        errorMessage: '',

        notReadyToSave: Ember['default'].computed('tempPassword', function () {
            return Ember['default'].isEmpty(this.get('tempPassword'));
        }),

        withSecret: Ember['default'].computed('allPasswords', function () {
            return this.get('allPasswords').filter(function (password) {
                return password.get('secret.length') > 0;
            });
        }),

        completeSave: function completeSave(masterPassword) {
            var that = this,
                withSecret = this.get('withSecret'),
                reference,
                ciphered;

            if (withSecret.get('length') > 0) {
                reference = withSecret.get('firstObject.secret');
                try {
                    sjcl.decrypt(masterPassword, reference);
                } catch (err) {
                    this.set('errorMessage', 'Wrong master password');
                    return;
                }
            }

            try {
                ciphered = sjcl.encrypt(masterPassword, this.get('tempPassword'), this.settings.getSetting('encryptOptions'));
            } catch (err) {
                this.set('errorMessage', 'Unknown error encrypting your ' + 'password, please try again later');
                return;
            }
            this.set('model.creation', new Date());
            this.set('model.secret', ciphered);
            masterPassword = null;

            this.get('model').save().then(function () {
                that.transitionToRoute('passwords.index');
            })['catch'](function () {
                this.set('errorMessage', 'Unknown error saving your password');
            });
        },

        actions: {
            updatePassword: function updatePassword(newPassword) {
                this.set('tempPassword', newPassword);
            },

            updateTags: function updateTags(newTags) {
                this.set('tags', newTags);
            },

            sendMasterPassword: function sendMasterPassword(masterPassword) {
                this.set('requestMasterPassword', false);
                // TODO save temporal copy of the masterPassword if necessary
                this.completeSave(masterPassword);
            },

            save: function save() {
                this.set('errorMessage', '');
                this.set('requestMasterPassword', true);
            }
        }
    });

});
define('yith-responsive-client/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'yith-responsive-client/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
  };

});
define('yith-responsive-client/initializers/authmanager', ['exports', 'yith-responsive-client/utils/authmanager'], function (exports, AuthManager) {

    'use strict';

    // Copyright (c) 2015 Lorenzo Gil
    // MIT License

    exports['default'] = {
        name: 'authManager',

        initialize: function initialize(application) {
            application.register('authmanager:main', AuthManager['default']);

            application.inject('controller', 'authManager', 'authmanager:main');
            application.inject('route', 'authManager', 'authmanager:main');
            application.inject('adapter', 'authManager', 'authmanager:main');
        }
    };

});
define('yith-responsive-client/initializers/export-application-global', ['exports', 'ember', 'yith-responsive-client/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('yith-responsive-client/initializers/settings', ['exports', 'yith-responsive-client/utils/settings'], function (exports, Settings) {

    'use strict';

    // Copyright (c) 2015 Lorenzo Gil
    // MIT License

    exports['default'] = {
        name: 'settings',

        initialize: function initialize(application) {
            application.register('settings:main', Settings['default']);

            application.inject('route', 'settings', 'settings:main');
            application.inject('controller', 'settings', 'settings:main');
            application.inject('adapter', 'settings', 'settings:main');
        }
    };

});
define('yith-responsive-client/models/password', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = DS['default'].Model.extend({
        account: DS['default'].attr('string'),
        creation: DS['default'].attr('date'),
        expiration: DS['default'].attr('number'),
        notes: DS['default'].attr('string'),
        secret: DS['default'].attr('string'),
        service: DS['default'].attr('string'),
        tags: DS['default'].attr()
    });

});
define('yith-responsive-client/router', ['exports', 'ember', 'yith-responsive-client/config/environment'], function (exports, Ember, config) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.route('index', {
            path: '/'
        });
        this.route('tos');
        this.route('authorize');

        this.route('passwords', {
            path: '/passwords/'
        }, function () {
            this.route('new');
            this.route('edit', {
                path: '/edit/:password_id'
            });
        });
    });

    exports['default'] = Router;

});
define('yith-responsive-client/routes/authorize', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            var serverBaseUrl = this.settings.getSetting('serverBaseUrl');
            return this.authManager.authorize(serverBaseUrl);
        },

        afterModel: function afterModel() {
            this.transitionTo('passwords');
        }
    });

});
define('yith-responsive-client/routes/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
	// MIT License

	exports['default'] = Ember['default'].Route.extend({});

});
define('yith-responsive-client/routes/passwords/edit', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            return this.store.findRecord('password', params.password_id);
        },

        afterModel: function afterModel() {
            // Make sure they are loaded
            return this.store.findAll('password');
        },

        setupController: function setupController(controller, model) {
            this._super(controller, model);
            this.store.findAll('password').then(function (passwords) {
                controller.set('allPasswords', passwords);
            });
            controller.set('tempPassword', null);
            controller.set('requestMasterPassword', false);
            controller.set('wantsToModifyPassword', false);
        },

        actions: {
            willTransition: function willTransition() {
                var model = this.controller.get('model');

                this.controller.set('tempPassword', null);
                if (model.get('isDirty')) {
                    // Discard unsaved changes
                    model.rollback();
                }
                return true;
            }
        }
    });

});
define('yith-responsive-client/routes/passwords/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.findAll('password');
        },

        setupController: function setupController(controller, model) {
            controller.set('model', model);
            controller.set('requestMasterPassword', false);
            controller.set('searchText', '');
            controller.set('activeTags', []);
        },

        renderTemplate: function renderTemplate() {
            Ember['default'].run.scheduleOnce('afterRender', this, function () {
                Ember['default'].$('button[data-toggle=popover]').popover();
            });
            this._super();
        }
    });

});
define('yith-responsive-client/routes/passwords/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return Ember['default'].RSVP.all([this.store.createRecord('password'), this.store.findAll('password')]);
        },

        setupController: function setupController(controller, models) {
            this._super(controller, models[0]);
            controller.set('allPasswords', models[1]);
            controller.set('tempPassword', null);
            controller.set('requestMasterPassword', false);
        },

        actions: {
            willTransition: function willTransition() {
                var model = this.controller.get('model');

                this.controller.set('tempPassword', null);
                if (Ember['default'].isNone(model.get('id'))) {
                    // Cancelling creation, delete not-saved model
                    model.destroyRecord();
                }
                return true;
            }
        }
    });

});
define('yith-responsive-client/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 10
            },
            "end": {
              "line": 16,
              "column": 38
            }
          },
          "moduleName": "yith-responsive-client/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("List");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 10
            },
            "end": {
              "line": 19,
              "column": 50
            }
          },
          "moduleName": "yith-responsive-client/templates/application.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("New Password");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 28,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","navbar navbar-inverse navbar-fixed-top");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","navbar-header");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"class","navbar-toggle collapsed");
        dom.setAttribute(el4,"data-toggle","collapse");
        dom.setAttribute(el4,"data-target","#navbar-collapsed");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","fui-list");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"class","navbar-brand");
        dom.setAttribute(el4,"href","/#");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","visible-xs-inline");
        var el6 = dom.createTextNode("Yith Library");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","hidden-xs");
        var el6 = dom.createTextNode("Yith Library Webclient");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","collapse navbar-collapse");
        dom.setAttribute(el3,"id","navbar-collapsed");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","nav navbar-nav");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 3, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        return morphs;
      },
      statements: [
        ["block","link-to",["passwords"],[],0,null,["loc",[null,[16,10],[16,50]]]],
        ["block","link-to",["passwords.new"],[],1,null,["loc",[null,[19,10],[19,62]]]],
        ["content","outlet",["loc",[null,[26,2],[26,12]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('yith-responsive-client/templates/authorize', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/authorize.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('yith-responsive-client/templates/components/ask-confirmation', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 25,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/components/ask-confirmation.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("button");
        dom.setAttribute(el1,"type","button");
        dom.setAttribute(el1,"name","button");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal ask-confirmation-modal text-left fade");
        dom.setAttribute(el1,"tabindex","-1");
        dom.setAttribute(el1,"role","dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-dialog");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","close");
        dom.setAttribute(el5,"data-dismiss","modal");
        dom.setAttribute(el5,"aria-label","Close");
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"aria-hidden","true");
        var el7 = dom.createTextNode("×");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5,"class","modal-title");
        var el6 = dom.createTextNode("\n          Are you sure?\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn btn-default");
        dom.setAttribute(el5,"data-dismiss","modal");
        var el6 = dom.createTextNode("\n          Cancel\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" /.modal-content ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" /.modal-dialog ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.modal ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(fragment, [2, 1, 1, 3, 3]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createMorphAt(element0,1,1);
        morphs[2] = dom.createAttrMorph(element1, 'class');
        morphs[3] = dom.createMorphAt(element1,1,1);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["ask-confirmation ",["get","cssClass",["loc",[null,[1,62],[1,70]]]]]]],
        ["content","yield",["loc",[null,[2,2],[2,11]]]],
        ["attribute","class",["concat",["confirm ",["get","cssClass",["loc",[null,[18,47],[18,55]]]]]]],
        ["content","yield",["loc",[null,[19,10],[19,19]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('yith-responsive-client/templates/components/ask-master-password', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 8
            },
            "end": {
              "line": 18,
              "column": 8
            }
          },
          "moduleName": "yith-responsive-client/templates/components/ask-master-password.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-danger");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["content","errorMessage",["loc",[null,[16,12],[16,28]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 27,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/components/ask-master-password.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal fade");
        dom.setAttribute(el1,"id","master-password-modal");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-dialog");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","close");
        dom.setAttribute(el5,"data-dismiss","modal");
        dom.setAttribute(el5,"aria-label","Close");
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"aria-hidden","true");
        var el7 = dom.createTextNode("×");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5,"class","modal-title");
        var el6 = dom.createTextNode("Input your master password");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("form");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","form-group");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn btn-default");
        dom.setAttribute(el5,"data-dismiss","modal");
        var el6 = dom.createTextNode("Cancel");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn btn-primary");
        var el6 = dom.createTextNode("Accept");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" /.modal-content ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" /.modal-dialog ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.modal ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 1]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [5, 3]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1, 1]),1,1);
        morphs[1] = dom.createMorphAt(element1,3,3);
        morphs[2] = dom.createElementMorph(element2);
        return morphs;
      },
      statements: [
        ["inline","input",[],["type","password","class","form-control","value",["subexpr","@mut",[["get","masterPassword",["loc",[null,[11,63],[11,77]]]]],[],[]]],["loc",[null,[11,12],[11,79]]]],
        ["block","if",[["get","errorMessage",["loc",[null,[14,14],[14,26]]]]],[],0,null,["loc",[null,[14,8],[18,15]]]],
        ["element","action",["sendToController"],[],["loc",[null,[22,54],[22,83]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('yith-responsive-client/templates/components/edit-password-field', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 2
            },
            "end": {
              "line": 38,
              "column": 2
            }
          },
          "moduleName": "yith-responsive-client/templates/components/edit-password-field.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","well well-sm");
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","row");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","col-xs-6 pass-gen-checkboxes");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("label");
          dom.setAttribute(el4,"class","checkbox passGenUseChars");
          var el5 = dom.createTextNode("\n          Use characters\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("label");
          dom.setAttribute(el4,"class","checkbox passGenUseNumbers");
          var el5 = dom.createTextNode("\n          Use numbers\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("label");
          dom.setAttribute(el4,"class","checkbox passGenUseSymbols");
          var el5 = dom.createTextNode("\n          Use symbols\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","col-xs-6");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","form-group");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("label");
          var el6 = dom.createTextNode("Length");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 0, 3, 1]),3,3);
          return morphs;
        },
        statements: [
          ["inline","input",[],["type","number","class","form-control","step",1,"min",1,"value",["subexpr","@mut",[["get","passGenLength",["loc",[null,[34,24],[34,37]]]]],[],[]]],["loc",[null,[33,10],[34,39]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 54,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/components/edit-password-field.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","password-edit-field");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("label");
        dom.setAttribute(el2,"for","password1");
        var el3 = dom.createTextNode("Password");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-6");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"name","button");
        dom.setAttribute(el4,"class","btn btn-default btn-sm");
        var el5 = dom.createTextNode("\n        Generate password\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-6 text-right");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"name","button");
        dom.setAttribute(el4,"class","btn btn-default btn-sm");
        var el5 = dom.createTextNode("\n        Generator options\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-12 col-sm-6 has-preview");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","fui-eye preview-password");
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-12 col-sm-6");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","password-strength-meter");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1, 1]);
        var element3 = dom.childAt(element1, [3, 1]);
        var element4 = dom.childAt(element0, [7]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element5, [3]);
        var morphs = new Array(8);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createElementMorph(element2);
        morphs[2] = dom.createAttrMorph(element3, 'disabled');
        morphs[3] = dom.createElementMorph(element3);
        morphs[4] = dom.createMorphAt(element0,5,5);
        morphs[5] = dom.createMorphAt(element5,1,1);
        morphs[6] = dom.createElementMorph(element6);
        morphs[7] = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["form-group ",["subexpr","if",[["get","invalid",["loc",[null,[1,28],[1,35]]]],"has-error"],[],["loc",[null,[1,23],[1,49]]]]]]],
        ["element","action",["generatePassword"],[],["loc",[null,[6,14],[6,43]]]],
        ["attribute","disabled",["get","showGeneratorOptions",["loc",[null,[12,50],[12,70]]]]],
        ["element","action",["showOptions"],[],["loc",[null,[12,14],[12,38]]]],
        ["block","if",[["get","showGeneratorOptions",["loc",[null,[17,8],[17,28]]]]],[],0,null,["loc",[null,[17,2],[38,9]]]],
        ["inline","input",[],["type",["subexpr","@mut",[["get","inputType",["loc",[null,[41,19],[41,28]]]]],[],[]],"name","password1","class","form-control","value",["subexpr","@mut",[["get","password1",["loc",[null,[42,20],[42,29]]]]],[],[]]],["loc",[null,[41,6],[42,31]]]],
        ["element","action",["previewPassword"],[],["loc",[null,[44,12],[44,40]]]],
        ["inline","input",[],["type",["subexpr","@mut",[["get","inputType",["loc",[null,[48,19],[48,28]]]]],[],[]],"name","password2","class","form-control","value",["subexpr","@mut",[["get","password2",["loc",[null,[49,20],[49,29]]]]],[],[]],"placeholder","Repeat password"],["loc",[null,[48,6],[49,61]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('yith-responsive-client/templates/components/password-viewer-countdown', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": false,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 4,
              "column": 0
            }
          },
          "moduleName": "yith-responsive-client/templates/components/password-viewer-countdown.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          return morphs;
        },
        statements: [
          ["inline","input",[],["value",["subexpr","@mut",[["get","passwordPlain",["loc",[null,[2,16],[2,29]]]]],[],[]],"class","fira"],["loc",[null,[2,2],[2,44]]]],
          ["content","countdown",["loc",[null,[3,8],[3,21]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 0
            },
            "end": {
              "line": 8,
              "column": 0
            }
          },
          "moduleName": "yith-responsive-client/templates/components/password-viewer-countdown.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1,"class","btn btn-primary btn-large btn-block");
          var el2 = dom.createTextNode("\n    View password\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [
          ["element","action",["showPassword"],[],["loc",[null,[5,54],[5,79]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/components/password-viewer-countdown.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","isBeingShown",["loc",[null,[1,6],[1,18]]]]],[],0,1,["loc",[null,[1,0],[8,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('yith-responsive-client/templates/components/tags-input', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/components/tags-input.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","tagsinput-default");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"name","tagsinput");
        dom.setAttribute(el2,"class","tagsinput");
        dom.setAttribute(el2,"data-role","tagsinput");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'value');
        return morphs;
      },
      statements: [
        ["attribute","value",["concat",[["get","tagsAsString",["loc",[null,[3,18],[3,30]]]]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('yith-responsive-client/templates/components/togglable-label', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 2
            },
            "end": {
              "line": 5,
              "column": 2
            }
          },
          "moduleName": "yith-responsive-client/templates/components/togglable-label.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","fui-cross");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 8,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/components/togglable-label.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("span");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element0, 'class');
        morphs[1] = dom.createElementMorph(element0);
        morphs[2] = dom.createMorphAt(element0,1,1);
        morphs[3] = dom.createMorphAt(element0,3,3);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",["label togglable-label label-",["get","statusClass",["loc",[null,[1,43],[1,54]]]]]]],
        ["element","action",["toggle"],[],["loc",[null,[2,6],[2,25]]]],
        ["block","if",[["get","status",["loc",[null,[3,8],[3,14]]]]],[],0,null,["loc",[null,[3,2],[5,9]]]],
        ["content","text",["loc",[null,[6,2],[6,10]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('yith-responsive-client/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 4
            },
            "end": {
              "line": 9,
              "column": 57
            }
          },
          "moduleName": "yith-responsive-client/templates/index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Enter");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": null,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 19,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-12");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Welcome to Yith Library");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n      Secure service to store your passwords ciphered under a master password.\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"src","assets/images/yithian.png");
        dom.setAttribute(el3,"class","img-responsive");
        dom.setAttribute(el3,"alt","Yith Library mascot");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("blockquote");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("couldn't live a week without a private library.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("footer");
        var el5 = dom.createTextNode("H. P. Lovecraft");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]),5,5);
        return morphs;
      },
      statements: [
        ["block","link-to",["authorize"],["class","btn btn-primary"],0,null,["loc",[null,[9,4],[9,69]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('yith-responsive-client/templates/passwords/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 6
            },
            "end": {
              "line": 15,
              "column": 6
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/edit.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","edit-password-field",[],["action","updatePassword","settings",["subexpr","@mut",[["get","settings",["loc",[null,[14,63],[14,71]]]]],[],[]]],["loc",[null,[14,8],[14,73]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 15,
              "column": 6
            },
            "end": {
              "line": 20,
              "column": 6
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/edit.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1,"type","button");
          dom.setAttribute(el1,"class","btn btn-default");
          var el2 = dom.createTextNode("\n          Modify password\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [
          ["element","action",["letsModifyPassword"],[],["loc",[null,[17,16],[17,47]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 34,
              "column": 0
            },
            "end": {
              "line": 42,
              "column": 0
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/edit.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","col-xs-12");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","alert alert-danger");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]),1,1);
          return morphs;
        },
        statements: [
          ["content","errorMessage",["loc",[null,[38,8],[38,24]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 45,
              "column": 4
            },
            "end": {
              "line": 45,
              "column": 58
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/edit.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Cancel");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 52,
              "column": 4
            },
            "end": {
              "line": 54,
              "column": 4
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/edit.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      Delete\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 60,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/passwords/edit.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-12");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","service");
        var el6 = dom.createTextNode("Service");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","account");
        var el6 = dom.createTextNode("Account");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Tags");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","notes");
        var el6 = dom.createTextNode("Notes");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"type","button");
        dom.setAttribute(el3,"name","button");
        dom.setAttribute(el3,"class","btn btn-primary");
        var el4 = dom.createTextNode("\n      Save\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-4 text-right");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0, 1, 1]);
        var element2 = dom.childAt(fragment, [3]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element3, [3]);
        var morphs = new Array(11);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]),3,3);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]),3,3);
        morphs[2] = dom.createMorphAt(element1,5,5);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [7]),3,3);
        morphs[4] = dom.createMorphAt(dom.childAt(element1, [9]),3,3);
        morphs[5] = dom.createMorphAt(fragment,2,2,contextualElement);
        morphs[6] = dom.createMorphAt(element3,1,1);
        morphs[7] = dom.createAttrMorph(element4, 'disabled');
        morphs[8] = dom.createElementMorph(element4);
        morphs[9] = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
        morphs[10] = dom.createMorphAt(fragment,5,5,contextualElement);
        return morphs;
      },
      statements: [
        ["inline","input",[],["name","service","class","form-control","value",["subexpr","@mut",[["get","model.service",["loc",[null,[6,58],[6,71]]]]],[],[]]],["loc",[null,[6,8],[6,73]]]],
        ["inline","input",[],["name","account","class","form-control","value",["subexpr","@mut",[["get","model.account",["loc",[null,[10,58],[10,71]]]]],[],[]]],["loc",[null,[10,8],[10,73]]]],
        ["block","if",[["get","wantsToModifyPassword",["loc",[null,[13,12],[13,33]]]]],[],0,1,["loc",[null,[13,6],[20,13]]]],
        ["inline","tags-input",[],["tags",["subexpr","@mut",[["get","model.tags",["loc",[null,[24,26],[24,36]]]]],[],[]],"action","updateTags"],["loc",[null,[24,8],[24,58]]]],
        ["inline","textarea",[],["name","notes","class","form-control","rows","3","value",["subexpr","@mut",[["get","model.notes",["loc",[null,[29,25],[29,36]]]]],[],[]]],["loc",[null,[28,8],[29,38]]]],
        ["block","if",[["get","errorMessage",["loc",[null,[34,6],[34,18]]]]],[],2,null,["loc",[null,[34,0],[42,7]]]],
        ["block","link-to",["passwords"],["class","btn btn-default"],3,null,["loc",[null,[45,4],[45,70]]]],
        ["attribute","disabled",["concat",[["subexpr","if",[["get","notReadyToSave",["loc",[null,[47,45],[47,59]]]],"disabled"],[],["loc",[null,[47,40],[47,72]]]]]]],
        ["element","action",["save"],[],["loc",[null,[47,12],[47,29]]]],
        ["block","ask-confirmation",[],["cssClass","btn btn-danger","action","delete"],4,null,["loc",[null,[52,4],[54,25]]]],
        ["inline","ask-master-password",[],["action","sendMasterPassword","flag",["subexpr","@mut",[["get","requestMasterPassword",["loc",[null,[58,55],[58,76]]]]],[],[]],"testPassword",["subexpr","@mut",[["get","model",["loc",[null,[59,35],[59,40]]]]],[],[]]],["loc",[null,[58,0],[59,42]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
define('yith-responsive-client/templates/passwords/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 6
            },
            "end": {
              "line": 15,
              "column": 6
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","togglable-label",[],["text",["subexpr","@mut",[["get","tag",["loc",[null,[13,33],[13,36]]]]],[],[]],"action","toggleTag"],["loc",[null,[13,10],[13,57]]]]
        ],
        locals: ["tag"],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 28,
              "column": 0
            },
            "end": {
              "line": 36,
              "column": 0
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","col-xs-12");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","alert alert-danger");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]),1,1);
          return morphs;
        },
        statements: [
          ["content","errorMessage",["loc",[null,[32,8],[32,24]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.1",
            "loc": {
              "source": null,
              "start": {
                "line": 46,
                "column": 10
              },
              "end": {
                "line": 48,
                "column": 10
              }
            },
            "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","fui-gear");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.1",
            "loc": {
              "source": null,
              "start": {
                "line": 56,
                "column": 10
              },
              "end": {
                "line": 62,
                "column": 10
              }
            },
            "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"type","button");
            dom.setAttribute(el1,"class","btn btn-sm btn-default");
            dom.setAttribute(el1,"data-container","body");
            dom.setAttribute(el1,"data-toggle","popover");
            dom.setAttribute(el1,"data-placement","left");
            var el2 = dom.createTextNode("\n              Notes\n            ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element0, 'data-content');
            return morphs;
          },
          statements: [
            ["attribute","data-content",["concat",[["get","password.notes",["loc",[null,[59,58],[59,72]]]]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 39,
              "column": 2
            },
            "end": {
              "line": 67,
              "column": 2
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-sm-6 col-md-4 col-lg-3");
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","tile");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","row");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","col-xs-9");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("h3");
          dom.setAttribute(el5,"class","tile-title");
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","col-xs-3 text-right");
          var el5 = dom.createTextNode("\n");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","row");
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","col-xs-8");
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("p");
          var el6 = dom.createTextNode("Account: \"");
          dom.appendChild(el5, el6);
          var el6 = dom.createComment("");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\"");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","col-xs-4 text-right");
          var el5 = dom.createTextNode("\n");
          dom.appendChild(el4, el5);
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("        ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n      ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1, 0]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element1, [3]);
          var morphs = new Array(5);
          morphs[0] = dom.createMorphAt(dom.childAt(element2, [1, 1]),0,0);
          morphs[1] = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
          morphs[2] = dom.createMorphAt(dom.childAt(element3, [1, 1]),1,1);
          morphs[3] = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
          morphs[4] = dom.createMorphAt(element1,5,5);
          return morphs;
        },
        statements: [
          ["content","password.service",["loc",[null,[43,33],[43,53]]]],
          ["block","link-to",["passwords.edit",["get","password",["loc",[null,[46,38],[46,46]]]]],["class","btn btn-sm btn-info","title","Edit"],0,null,["loc",[null,[46,10],[48,22]]]],
          ["content","password.account",["loc",[null,[53,23],[53,43]]]],
          ["block","if",[["get","password.notes",["loc",[null,[56,16],[56,30]]]]],[],1,null,["loc",[null,[56,10],[62,17]]]],
          ["inline","password-viewer-countdown",[],["password",["subexpr","@mut",[["get","password",["loc",[null,[65,43],[65,51]]]]],[],[]],"action","decipher"],["loc",[null,[65,6],[65,71]]]]
        ],
        locals: ["password"],
        templates: [child0, child1]
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "topLevel": null,
            "revision": "Ember@2.1.1",
            "loc": {
              "source": null,
              "start": {
                "line": 73,
                "column": 8
              },
              "end": {
                "line": 75,
                "column": 8
              }
            },
            "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          Add New Password\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 67,
              "column": 2
            },
            "end": {
              "line": 78,
              "column": 2
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-xs-12");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","alert alert-info");
          var el3 = dom.createTextNode("\n        You don't have any passwords yet, please add one.\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","text-center");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 3]),1,1);
          return morphs;
        },
        statements: [
          ["block","link-to",["passwords.new"],["class","btn btn-primary"],0,null,["loc",[null,[73,8],[75,20]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 83,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/passwords/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 hidden-xs");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Your Passwords");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-12 col-sm-8");
        var el3 = dom.createTextNode("\n    Filter by tags:\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","list-inline");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-12 col-sm-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","input-group");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","input-group-addon");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5,"class","fui-search");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row password-grid");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element4 = dom.childAt(fragment, [2]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element4, [1, 1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [3, 1]),1,1);
        morphs[2] = dom.createMorphAt(fragment,4,4,contextualElement);
        morphs[3] = dom.createMorphAt(dom.childAt(fragment, [6]),1,1);
        morphs[4] = dom.createMorphAt(fragment,8,8,contextualElement);
        return morphs;
      },
      statements: [
        ["block","each",[["get","allTags",["loc",[null,[11,14],[11,21]]]]],[],0,null,["loc",[null,[11,6],[15,15]]]],
        ["inline","input",[],["class","form-control","placeholder","Search","value",["subexpr","@mut",[["get","searchText",["loc",[null,[20,62],[20,72]]]]],[],[]]],["loc",[null,[20,6],[20,74]]]],
        ["block","if",[["get","errorMessage",["loc",[null,[28,6],[28,18]]]]],[],1,null,["loc",[null,[28,0],[36,7]]]],
        ["block","each",[["get","filteredPasswords",["loc",[null,[39,10],[39,27]]]]],[],2,3,["loc",[null,[39,2],[78,11]]]],
        ["inline","ask-master-password",[],["action","sendMasterPassword","flag",["subexpr","@mut",[["get","requestMasterPassword",["loc",[null,[81,55],[81,76]]]]],[],[]],"testPassword",["subexpr","@mut",[["get","onePassword",["loc",[null,[82,35],[82,46]]]]],[],[]]],["loc",[null,[81,0],[82,48]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  }()));

});
define('yith-responsive-client/templates/passwords/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 4
            },
            "end": {
              "line": 31,
              "column": 4
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/new.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-danger");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["content","errorMessage",["loc",[null,[29,8],[29,24]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "topLevel": null,
          "revision": "Ember@2.1.1",
          "loc": {
            "source": null,
            "start": {
              "line": 32,
              "column": 4
            },
            "end": {
              "line": 32,
              "column": 58
            }
          },
          "moduleName": "yith-responsive-client/templates/passwords/new.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Cancel");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    return {
      meta: {
        "topLevel": false,
        "revision": "Ember@2.1.1",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 42,
            "column": 0
          }
        },
        "moduleName": "yith-responsive-client/templates/passwords/new.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-xs-12");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","service");
        var el6 = dom.createTextNode("Service");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","account");
        var el6 = dom.createTextNode("Account");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        var el6 = dom.createTextNode("Tags");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","notes");
        var el6 = dom.createTextNode("Notes");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-12");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"type","button");
        dom.setAttribute(el3,"name","button");
        dom.setAttribute(el3,"class","btn btn-primary pull-right");
        var el4 = dom.createTextNode("\n      Add\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 1]);
        var element1 = dom.childAt(fragment, [2, 1]);
        var element2 = dom.childAt(element1, [5]);
        var morphs = new Array(10);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),3,3);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),3,3);
        morphs[2] = dom.createMorphAt(element0,5,5);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [7]),3,3);
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [9]),3,3);
        morphs[5] = dom.createMorphAt(element1,1,1);
        morphs[6] = dom.createMorphAt(element1,3,3);
        morphs[7] = dom.createAttrMorph(element2, 'disabled');
        morphs[8] = dom.createElementMorph(element2);
        morphs[9] = dom.createMorphAt(fragment,4,4,contextualElement);
        return morphs;
      },
      statements: [
        ["inline","input",[],["name","service","class","form-control","value",["subexpr","@mut",[["get","model.service",["loc",[null,[6,58],[6,71]]]]],[],[]]],["loc",[null,[6,8],[6,73]]]],
        ["inline","input",[],["name","account","class","form-control","value",["subexpr","@mut",[["get","model.account",["loc",[null,[10,58],[10,71]]]]],[],[]]],["loc",[null,[10,8],[10,73]]]],
        ["inline","edit-password-field",[],["action","updatePassword","settings",["subexpr","@mut",[["get","settings",["loc",[null,[12,61],[12,69]]]]],[],[]]],["loc",[null,[12,6],[12,71]]]],
        ["inline","tags-input",[],["tags",["subexpr","@mut",[["get","model.tags",["loc",[null,[15,26],[15,36]]]]],[],[]],"action","updateTags"],["loc",[null,[15,8],[15,58]]]],
        ["inline","textarea",[],["name","notes","class","form-control","rows","3","value",["subexpr","@mut",[["get","model.notes",["loc",[null,[20,25],[20,36]]]]],[],[]]],["loc",[null,[19,8],[20,38]]]],
        ["block","if",[["get","errorMessage",["loc",[null,[27,10],[27,22]]]]],[],0,null,["loc",[null,[27,4],[31,11]]]],
        ["block","link-to",["passwords"],["class","btn btn-default"],1,null,["loc",[null,[32,4],[32,70]]]],
        ["attribute","disabled",["concat",[["subexpr","if",[["get","notReadyToSave",["loc",[null,[34,45],[34,59]]]],"disabled"],[],["loc",[null,[34,40],[34,72]]]]]]],
        ["element","action",["save"],[],["loc",[null,[34,12],[34,29]]]],
        ["inline","ask-master-password",[],["action","sendMasterPassword","flag",["subexpr","@mut",[["get","requestMasterPassword",["loc",[null,[40,55],[40,76]]]]],[],[]],"testPassword",["subexpr","@mut",[["get","withSecret.firstObject",["loc",[null,[41,35],[41,57]]]]],[],[]]],["loc",[null,[40,0],[41,59]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('yith-responsive-client/tests/adapters/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('app.js should pass jshint', function(assert) { 
    assert.ok(true, 'app.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/components/ask-confirmation.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/ask-confirmation.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/ask-confirmation.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/components/ask-master-password.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/ask-master-password.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/ask-master-password.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/components/edit-password-field.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/edit-password-field.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/edit-password-field.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/components/password-viewer-countdown.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/password-viewer-countdown.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/password-viewer-countdown.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/components/tags-input.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/tags-input.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/tags-input.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/components/togglable-label.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/togglable-label.js should pass jshint', function(assert) { 
    assert.ok(true, 'components/togglable-label.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/controllers/authorize.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/authorize.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/authorize.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/controllers/passwords/edit.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/passwords');
  QUnit.test('controllers/passwords/edit.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/passwords/edit.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/controllers/passwords/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/passwords');
  QUnit.test('controllers/passwords/index.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/passwords/index.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/controllers/passwords/new.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers/passwords');
  QUnit.test('controllers/passwords/new.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/passwords/new.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/helpers/resolver', ['exports', 'ember/resolver', 'yith-responsive-client/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('yith-responsive-client/tests/helpers/resolver.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/resolver.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/helpers/start-app', ['exports', 'ember', 'yith-responsive-client/app', 'yith-responsive-client/router', 'yith-responsive-client/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('yith-responsive-client/tests/helpers/start-app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/start-app.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/initializers/authmanager.jshint', function () {

  'use strict';

  QUnit.module('JSHint - initializers');
  QUnit.test('initializers/authmanager.js should pass jshint', function(assert) { 
    assert.ok(true, 'initializers/authmanager.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/initializers/settings.jshint', function () {

  'use strict';

  QUnit.module('JSHint - initializers');
  QUnit.test('initializers/settings.js should pass jshint', function(assert) { 
    assert.ok(true, 'initializers/settings.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/integration/components/ask-confirmation-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('ask-confirmation', 'Integration | Component | ask confirmation', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'topLevel': null,
          'revision': 'Ember@2.1.1',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 20
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'ask-confirmation', ['loc', [null, [1, 0], [1, 20]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'topLevel': null,
            'revision': 'Ember@2.1.1',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'topLevel': null,
          'revision': 'Ember@2.1.1',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'ask-confirmation', [], [], 0, null, ['loc', [null, [2, 4], [4, 25]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('yith-responsive-client/tests/integration/components/ask-confirmation-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - integration/components');
  QUnit.test('integration/components/ask-confirmation-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'integration/components/ask-confirmation-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/integration/components/tags-input-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('tags-input', 'Integration | Component | tags input', {
    integration: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'topLevel': null,
          'revision': 'Ember@2.1.1',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 14
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'tags-input', ['loc', [null, [1, 0], [1, 14]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'topLevel': null,
            'revision': 'Ember@2.1.1',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'topLevel': null,
          'revision': 'Ember@2.1.1',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'tags-input', [], [], 0, null, ['loc', [null, [2, 4], [4, 19]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });

});
define('yith-responsive-client/tests/integration/components/tags-input-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - integration/components');
  QUnit.test('integration/components/tags-input-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'integration/components/tags-input-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/models/password.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/password.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/password.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/router.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('router.js should pass jshint', function(assert) { 
    assert.ok(true, 'router.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/routes/authorize.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/authorize.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/authorize.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/routes/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/index.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/routes/passwords/edit.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/passwords');
  QUnit.test('routes/passwords/edit.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/passwords/edit.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/routes/passwords/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/passwords');
  QUnit.test('routes/passwords/index.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/passwords/index.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/routes/passwords/new.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes/passwords');
  QUnit.test('routes/passwords/new.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/passwords/new.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/test-helper', ['yith-responsive-client/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('yith-responsive-client/tests/test-helper.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('test-helper.js should pass jshint', function(assert) { 
    assert.ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:application', 'Unit | Adapter | application', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

});
define('yith-responsive-client/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/adapters');
  QUnit.test('unit/adapters/application-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/adapters/oauth-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:oauth', 'Unit | Adapter | oauth', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

});
define('yith-responsive-client/tests/unit/adapters/oauth-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/adapters');
  QUnit.test('unit/adapters/oauth-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/adapters/oauth-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/components/ask-master-password-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('ask-master-password', 'Unit | Component | ask master password', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('yith-responsive-client/tests/unit/components/ask-master-password-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/components');
  QUnit.test('unit/components/ask-master-password-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/components/ask-master-password-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/components/edit-password-field-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('edit-password-field', 'Unit | Component | edit password field', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('yith-responsive-client/tests/unit/components/edit-password-field-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/components');
  QUnit.test('unit/components/edit-password-field-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/components/edit-password-field-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/components/password-viewer-countdown-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('password-viewer-countdown', 'Unit | Component | password viewer countdown', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('yith-responsive-client/tests/unit/components/password-viewer-countdown-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/components');
  QUnit.test('unit/components/password-viewer-countdown-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/components/password-viewer-countdown-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/components/togglable-label-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('togglable-label', 'Unit | Component | togglable label', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  });

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

});
define('yith-responsive-client/tests/unit/components/togglable-label-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/components');
  QUnit.test('unit/components/togglable-label-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/components/togglable-label-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/controllers/authorize-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:authorize', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('yith-responsive-client/tests/unit/controllers/authorize-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers');
  QUnit.test('unit/controllers/authorize-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/authorize-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/controllers/passwords/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:passwords/edit', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('yith-responsive-client/tests/unit/controllers/passwords/edit-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers/passwords');
  QUnit.test('unit/controllers/passwords/edit-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/passwords/edit-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/controllers/passwords/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:passwords/index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('yith-responsive-client/tests/unit/controllers/passwords/index-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers/passwords');
  QUnit.test('unit/controllers/passwords/index-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/passwords/index-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/controllers/passwords/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:passwords/new', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('yith-responsive-client/tests/unit/controllers/passwords/new-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers/passwords');
  QUnit.test('unit/controllers/passwords/new-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/passwords/new-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/initializers/authmanager-test', ['ember', 'yith-responsive-client/initializers/authmanager', 'qunit'], function (Ember, authmanager, qunit) {

  'use strict';

  var container, application;

  qunit.module('Unit | Initializer | authmanager', {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    authmanager.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('yith-responsive-client/tests/unit/initializers/authmanager-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/initializers');
  QUnit.test('unit/initializers/authmanager-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/initializers/authmanager-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/initializers/settings-test', ['ember', 'yith-responsive-client/initializers/settings', 'qunit'], function (Ember, settings, qunit) {

  'use strict';

  var container, application;

  qunit.module('Unit | Initializer | settings', {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    settings.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('yith-responsive-client/tests/unit/initializers/settings-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/initializers');
  QUnit.test('unit/initializers/settings-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/initializers/settings-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/models/password-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('password', 'Unit | Model | password', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('yith-responsive-client/tests/unit/models/password-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/models');
  QUnit.test('unit/models/password-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/models/password-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/routes/authorize-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:authorize', 'Unit | Route | authorize', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('yith-responsive-client/tests/unit/routes/authorize-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/authorize-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/authorize-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/routes/passwords/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:passwords/edit', 'Unit | Route | passwords/edit', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('yith-responsive-client/tests/unit/routes/passwords/edit-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes/passwords');
  QUnit.test('unit/routes/passwords/edit-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/passwords/edit-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/routes/passwords/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:passwords/index', 'Unit | Route | passwords/index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('yith-responsive-client/tests/unit/routes/passwords/index-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes/passwords');
  QUnit.test('unit/routes/passwords/index-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/passwords/index-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/routes/passwords/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:passwords/new', 'Unit | Route | passwords/new', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('yith-responsive-client/tests/unit/routes/passwords/new-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes/passwords');
  QUnit.test('unit/routes/passwords/new-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/passwords/new-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/unit/utils/settings-test', ['yith-responsive-client/utils/settings', 'qunit'], function (settings, qunit) {

  'use strict';

  qunit.module('Unit | Utility | settings');

  // Replace this with your real tests.
  qunit.test('it works', function (assert) {
    var result = settings['default']();
    assert.ok(result);
  });

});
define('yith-responsive-client/tests/unit/utils/settings-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/utils');
  QUnit.test('unit/utils/settings-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/utils/settings-test.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/utils/authmanager.jshint', function () {

  'use strict';

  QUnit.module('JSHint - utils');
  QUnit.test('utils/authmanager.js should pass jshint', function(assert) { 
    assert.ok(true, 'utils/authmanager.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/utils/passwordGenerator.jshint', function () {

  'use strict';

  QUnit.module('JSHint - utils');
  QUnit.test('utils/passwordGenerator.js should pass jshint', function(assert) { 
    assert.ok(true, 'utils/passwordGenerator.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/utils/settings.jshint', function () {

  'use strict';

  QUnit.module('JSHint - utils');
  QUnit.test('utils/settings.js should pass jshint', function(assert) { 
    assert.ok(true, 'utils/settings.js should pass jshint.'); 
  });

});
define('yith-responsive-client/tests/utils/snake-case-to-camel-case.jshint', function () {

  'use strict';

  QUnit.module('JSHint - utils');
  QUnit.test('utils/snake-case-to-camel-case.js should pass jshint', function(assert) { 
    assert.ok(true, 'utils/snake-case-to-camel-case.js should pass jshint.'); 
  });

});
define('yith-responsive-client/utils/authmanager', ['exports', 'ember', 'yith-responsive-client/utils/snake-case-to-camel-case', 'yith-responsive-client/config/environment'], function (exports, Ember, snakeCaseToCamelCase, ENV) {

    'use strict';

    // Copyright (c) 2015 Lorenzo Gil
    // MIT License

    exports['default'] = Ember['default'].Object.extend({

        clientId: ENV['default'].defaults.clientId,
        clientBaseUrl: ENV['default'].defaults.clientBaseUrl,
        scope: 'read-passwords write-passwords read-userinfo',
        accessToken: null,
        accessTokenExpiration: null,

        init: function init() {
            this._super();
            this.loadToken();
        },

        redirectUri: (function () {
            return this.get('clientBaseUrl') + '/assets/auth-callback.html';
        }).property('clientBaseUrl'),

        authUri: (function () {
            return [this.get('authBaseUri'), '?response_type=token', '&redirect_uri=' + encodeURIComponent(this.get('redirectUri')), '&client_id=' + encodeURIComponent(this.get('clientId')), '&scope=' + encodeURIComponent(this.get('scope'))].join('');
        }).property('authBaseUri', 'providerId', 'clientId', 'scope'),

        hasValidAccessToken: (function () {
            var accessToken = this.get('accessToken'),
                expiration = this.get('accessTokenExpiration');
            return accessToken !== null && this.now() < expiration;
        }).property('accessToken', 'accessTokenExpiration'),

        authorize: function authorize(serverBaseUrl) {
            var self = this,
                state = this.uuid(),
                encodedState = encodeURIComponent(state),
                authUri = this.get('authUri') + '&state=' + encodedState,
                uri = serverBaseUrl + '/oauth2/endpoints/authorization' + authUri,
                dialog = window.open(uri, 'Authorize', 'height=600, width=450'),
                clientBaseUrl = this.get('clientBaseUrl');

            if (window.focus) {
                dialog.focus();
            }

            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                Ember['default'].$(window).on('message', function (event) {
                    var params;
                    if (event.originalEvent.origin === clientBaseUrl) {
                        dialog.close();
                        params = self.parseHash(event.originalEvent.data);
                        if (self.checkResponse(params, state)) {
                            self.saveToken(params);
                            resolve();
                        } else {
                            reject();
                        }
                    }
                });
            });
        },

        parseHash: function parseHash(hash) {
            var params = {},
                queryString = hash.substring(1),
                // remove #
            regex = /([^#?&=]+)=([^&]*)/g,
                match = null,
                key = null;

            while ((match = regex.exec(queryString)) !== null) {
                key = snakeCaseToCamelCase['default'](decodeURIComponent(match[1]));
                params[key] = decodeURIComponent(match[2]);
            }
            return params;
        },

        checkResponse: function checkResponse(params, state) {
            return params.accessToken && params.state === state;
        },

        saveToken: function saveToken(token) {
            var expiration = this.now() + parseInt(token.expiresIn, 10);
            this.set('accessToken', token.accessToken);
            this.set('accessTokenExpiration', expiration);
            window.localStorage.setItem('accessToken', token.accessToken);
            window.localStorage.setItem('accessTokenExpiration', expiration);
        },

        loadToken: function loadToken() {
            var accessToken = window.localStorage.getItem('accessToken'),
                expiration = window.localStorage.getItem('accessTokenExpiration');
            this.set('accessToken', accessToken);
            this.set('accessTokenExpiration', expiration);
        },

        deleteToken: function deleteToken() {
            window.localStorage.removeItem('accessToken');
            window.localStorage.removeItem('accessTokenExpiration');
        },

        now: function now() {
            return Math.round(new Date().getTime() / 1000.0);
        },

        uuid: function uuid() {
            var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            return template.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        }
    });

});
define('yith-responsive-client/utils/passwordGenerator', ['exports'], function (exports) {

    'use strict';



    exports['default'] = generatePassword;
    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    var getCharset = function getCharset(settings) {
        // 33 start symbols
        // 48 start numbers
        // 58 start symbols again
        // 65 start chars
        // 91 start symbols again
        // 97 start chars again
        // 123 start symbols again
        // 126 end (included)

        var charset = "",
            passGenUseChars = settings.getSetting('passGenUseChars'),
            passGenUseNumbers = settings.getSetting('passGenUseNumbers'),
            passGenUseSymbols = settings.getSetting('passGenUseSymbols'),
            i;

        for (i = 33; i < 127; i += 1) {
            if (i >= 33 && i < 48 && passGenUseSymbols) {
                charset += String.fromCharCode(i);
            } else if (i >= 48 && i < 58 && passGenUseNumbers) {
                charset += String.fromCharCode(i);
            } else if (i >= 58 && i < 65 && passGenUseSymbols) {
                charset += String.fromCharCode(i);
            } else if (i >= 65 && i < 91 && passGenUseChars) {
                charset += String.fromCharCode(i);
            } else if (i >= 91 && i < 97 && passGenUseSymbols) {
                charset += String.fromCharCode(i);
            } else if (i >= 97 && i < 123 && passGenUseChars) {
                charset += String.fromCharCode(i);
            } else if (i >= 123 && i < 127 && passGenUseSymbols) {
                charset += String.fromCharCode(i);
            }
        }

        return charset;
    };
    function generatePassword(settings) {
        var charset = getCharset(settings),
            length = settings.getSetting('passGenLength'),
            password = '',
            aux,
            i;

        for (i = 0; i < length; i += 1) {
            aux = Math.floor(Math.random() * charset.length);
            password += charset.charAt(aux);
        }

        return password;
    }

});
define('yith-responsive-client/utils/settings', ['exports', 'ember', 'yith-responsive-client/config/environment'], function (exports, Ember, ENV) {

    'use strict';

    // Copyright (c) 2014 Lorenzo Gil
    // Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
    // MIT License

    exports['default'] = Ember['default'].Object.extend({
        defaults: {
            serverBaseUrl: ENV['default'].defaults.serverBaseUrl,
            clientId: ENV['default'].defaults.clientId,
            encryptOptions: ENV['default'].defaults.encryptOptions,
            passGenUseChars: true,
            passGenUseNumbers: true,
            passGenUseSymbols: true,
            passGenLength: 20
        },

        getSetting: function getSetting(name) {
            var setting = window.localStorage.getItem(name);
            if (setting === null) {
                return this.defaults[name] || null;
            } else {
                return JSON.parse(setting);
            }
        },

        setSetting: function setSetting(name, value) {
            var serialized = JSON.stringify(value);
            return window.localStorage.setItem(name, serialized);
        },

        deleteSetting: function deleteSetting(name) {
            window.localStorage.removeItem(name);
        }
    });

});
define('yith-responsive-client/utils/snake-case-to-camel-case', ['exports'], function (exports) {

    'use strict';



    exports['default'] = snakeCaseToCamelCase;
    // Copyright (c) 2015 Lorenzo Gil
    // MIT License

    function snakeCaseToCamelCase(symbol) {
        return symbol.split('_').filter(function (word) {
            return word !== '';
        }).map(function (word, idx) {
            if (idx === 0) {
                return word;
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
        }).join('');
    }

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('yith-responsive-client/config/environment', ['ember'], function(Ember) {
  var prefix = 'yith-responsive-client';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("yith-responsive-client/tests/test-helper");
} else {
  require("yith-responsive-client/app")["default"].create({"LOG_TRANSITIONS":true,"name":"yith-responsive-client","version":"0.0.1+3f270510"});
}

/* jshint ignore:end */
//# sourceMappingURL=yith-responsive-client.map