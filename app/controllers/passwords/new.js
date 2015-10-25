// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';

export default Ember.Controller.extend({
    notReadyToSave: Ember.computed('tempPassword', function () {
        return Ember.isEmpty(this.get('tempPassword'));
    }),

    completeSave: function (masterPassword) {
        var that = this,
            ciphered;

        // TODO validate masterPassword

        try {
            ciphered = sjcl.encrypt(masterPassword, this.get('tempPassword'));
        } catch (err) {
            // TODO
        }
        this.set('model.creation', new Date());
        this.set('model.secret', ciphered);
        masterPassword = null;

        this.get('model').save().then(function () {
            that.transitionToRoute('passwords/index');
        });
    },

    actions: {
        updatePassword: function (newPassword) {
            this.set('tempPassword', newPassword);
        },

        updateTags: function (newTags) {
            this.set('tags', newTags);
        },

        sendMasterPassword: function (masterPassword) {
            this.set('requestMasterPassword', false);
            // TODO save temporal copy of the masterPassword if necessary
            this.completeSave(masterPassword);
        },

        save: function () {
            this.set('requestMasterPassword', true);
        }
    }
});
