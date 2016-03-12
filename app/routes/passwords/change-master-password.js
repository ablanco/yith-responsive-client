// Copyright (c) 2016 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return this.store.findAll('password');
    },

    setupController: function (controller, model) {
        controller.set('model', model);
        controller.set('oldMasterPassword', '');
        controller.set('newMasterPassword1', '');
        controller.set('newMasterPassword2', '');
        controller.set('wrongMasterPassword', false);
    }
});
