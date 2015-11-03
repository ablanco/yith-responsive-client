import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return Ember.RSVP.all([
            this.store.createRecord('password'),
            this.store.findAll('password')
        ]);
    },

    setupController: function (controller, models) {
        this._super(controller, models[0]);
        controller.set('allPasswords', models[1]);
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
