import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return this.store.createRecord('password');
    },

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('tempPassword', null);
        controller.set('requestMasterPassword', false);
    },

    actions: {
        willTransition: function () {
            this.controller.set('tempPassword', null);
            return true;
        }
    }
});
