import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return this.store.createRecord('password');
    }

    // actions: {
    //     willTransition: function () {
    //         this.controller.set('tempPassword', null);
    //         return true;
    //     }
    // }
});
