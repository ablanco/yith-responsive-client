// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        var serverBaseUrl = this.settings.getSetting('serverBaseUrl');
        return this.authManager.authorize(serverBaseUrl);
    },

    afterModel: function () {
        this.transitionTo('passwords');
    }
});
