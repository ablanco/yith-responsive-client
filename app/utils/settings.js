// Copyright (c) 2014 Lorenzo Gil
// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';
import ENV from 'yith-responsive-client/config/environment';

export default Ember.Object.extend({
    defaults: {
        serverBaseUrl: ENV.defaults.serverBaseUrl,
        clientId: ENV.defaults.clientId,
        encryptOptions: ENV.defaults.encryptOptions,
        passGenUseChars: true,
        passGenUseNumbers: true,
        passGenUseSymbols: true,
        passGenLength: 20,
        rememberMasterPassword: false
    },

    getSetting: function (name) {
        var setting = window.localStorage.getItem(name);
        if (setting === null) {
            return this.defaults[name] || null;
        } else {
            return JSON.parse(setting);
        }
    },

    setSetting: function (name, value) {
        var serialized = JSON.stringify(value);
        return window.localStorage.setItem(name, serialized);
    },

    deleteSetting: function (name) {
        window.localStorage.removeItem(name);
    }
});
