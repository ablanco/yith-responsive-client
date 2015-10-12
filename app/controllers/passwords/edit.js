// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Controller.extend({
    notReadyToSave: Ember.computed('wantsToModifyPassword', 'tempPassword', function () {
        if (this.get('wantsToModifyPassword')) {
            return Ember.isEmpty(this.get('tempPassword'));
        }
        return false;
    }),

    actions: {
        updatePassword: function (newPassword) {
            this.set('tempPassword', newPassword);
        },

        updateTags: function (newTags) {
            this.set('tags', newTags);
        },

        letsModifyPassword: function () {
            this.set('wantsToModifyPassword', true);
        },

        save: function () {
            var that = this;

            if (this.get('letsModifyPassword')) {
                this.set('model.password', this.get('tempPassword'));
            }
            this.get('model').save().then(function () {
                that.transitionToRoute('passwords/index');
            });
        },

        delete: function () {
            var that = this;

            this.get('model').destroyRecord().then(function () {
                that.transitionToRoute('passwords/index');
            });
        }
    }
});
