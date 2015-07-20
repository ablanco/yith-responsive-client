// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Controller.extend({
    notReadyToSave: Ember.computed('tempPassword', function () {
        return Ember.isEmpty(this.get('tempPassword'));
    }),

    actions: {
        updatePassword: function (newPassword) {
            this.set('tempPassword', newPassword);
        },

        save: function () {
            var that = this;

            this.set('model.password', this.get('tempPassword'));
            this.get('model').save().then(function () {
                that.transitionToRoute('passwords/index');
            });
        }
    }
});
