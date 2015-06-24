// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        var authManager = this.authManager,
            serverBaseUrl = this.settings.getSetting('serverBaseUrl');

        return authManager.authorize(serverBaseUrl);
    },

    afterModel: function () {
        this.transitionTo('passwords');
    }
});
