// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function (params) {
        return this.store.findRecord('password', params.password_id);
    },

    actions: {
        willTransition: function () {
            this.controller.set('tempPassword', null);
            return true;
        }
    }
});
