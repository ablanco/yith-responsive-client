// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';

export default Ember.Controller.extend({
    errorMessage: '',

    notReadyToSave: Ember.computed('tempPassword', function () {
        return Ember.isEmpty(this.get('tempPassword'));
    }),

    withSecret: Ember.computed('allPasswords', function () {
        return this.get('allPasswords').filter(function (password) {
            return password.get('secret.length') > 0;
        });
    }),

    completeSave: function (masterPassword) {
        var that = this,
            withSecret = this.get('withSecret'),
            reference,
            ciphered;

        if (withSecret.get('length') > 0) {
            reference = withSecret.get('firstObject.secret');
            try {
                sjcl.decrypt(masterPassword, reference);
            } catch (err) {
                this.set('errorMessage', 'Wrong master password');
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
            this.set('errorMessage', 'Unknown error encrypting your ' +
                                     'password, please try again later');
            return;
        }
        this.set('model.creation', new Date());
        this.set('model.secret', ciphered);
        masterPassword = null;

        this.get('model').save().then(function () {
            that.transitionToRoute('passwords.index');
        }).catch(function () {
            this.set('errorMessage', 'Unknown error saving your password');
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
            var settings = this.get('settings');

            this.set('requestMasterPassword', false);
            if (settings.getSetting('rememberMasterPassword')) {
                window.yithMasterPassword = masterPassword;
                setTimeout(function () {
                    window.yithMasterPassword = null;
                }, 600000); // 10 min
            }
            this.completeSave(masterPassword);
        },

        save: function () {
            this.set('errorMessage', '');
            if (!Ember.isNone(window.yithMasterPassword)) {
                this.completeSave(window.yithMasterPassword);
            } else {
                this.set('requestMasterPassword', true);
            }
        }
    }
});
