// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return this.store.findAll('password');
    },

    setupController: function (controller, model) {
        controller.set('model', model);
        controller.set('requestMasterPassword', false);
    }
});
