// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';

export default Ember.Controller.extend({
    notReadyToSave: Ember.computed('wantsToModifyPassword', 'tempPassword', function () {
        if (this.get('wantsToModifyPassword')) {
            return Ember.isEmpty(this.get('tempPassword'));
        }
        return false;
    }),

    completeSave: function (masterPassword) {
        var that = this,
            withSecret,
            reference,
            ciphered;

        withSecret = this.get('allPasswords').filter(function (password) {
            return password.get('secret.length') > 0;
        });

        if (withSecret.get('length') > 0) {
            reference = withSecret.get('firstObject.secret');
            try {
                sjcl.decrypt(masterPassword, reference);
            } catch (err) {
                // TODO wrong master password
                return;
            }
        }

        try {
            ciphered = sjcl.encrypt(
                masterPassword,
                this.get('tempPassword'),
                this.settings.getSetting('encryptOptions')
            );
        } catch (err) {
            // TODO
        }
        this.set('model.modification', new Date());
        this.set('model.secret', ciphered);
        masterPassword = null;

        this.get('model').save().then(function () {
            that.transitionToRoute('passwords.index');
        });
    },

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

        sendMasterPassword: function (masterPassword) {
            this.set('requestMasterPassword', false);
            // TODO save temporal copy of the masterPassword if necessary
            this.completeSave(masterPassword);
        },

        save: function () {
            var that = this;

            if (this.get('wantsToModifyPassword')) {
                this.set('requestMasterPassword', true);
                return;
                // this.set('model.password', this.get('tempPassword'));
            }
            this.get('model').save().then(function () {
                that.transitionToRoute('passwords.index');
            });
        },

        delete: function () {
            var that = this;

            this.get('model').destroyRecord().then(function () {
                that.transitionToRoute('passwords.index');
            });
        }
    }
});
