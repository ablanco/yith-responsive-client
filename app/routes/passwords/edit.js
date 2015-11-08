// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function (params) {
        return this.store.findRecord('password', params.password_id);
    },

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('tempPassword', null);
        controller.set('wantsToModifyPassword', false);
    },

    actions: {
        willTransition: function () {
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
