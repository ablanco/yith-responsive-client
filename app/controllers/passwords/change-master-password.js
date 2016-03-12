// Copyright (c) 2016 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';

export default Ember.Controller.extend({
    notReadyToSave: Ember.computed('newMasterPassword1', 'newMasterPassword2', function () {
        var p1 = this.get('newMasterPassword1').trim(),
            p2 = this.get('newMasterPassword2').trim();

        if (p1.length === 0) { return true; }
        return p1 !== p2;
    }),

    hideError: Ember.observer('oldMasterPassword', function () {
        this.set('wrongMasterPassword', false);
    }),

    actions: {
        save: function () {
            var passwords = this.get('model'),
                oldMasterPassword = this.get('oldMasterPassword'),
                newMasterPassword = this.get('newMasterPassword1').trim(),
                error = false,
                that = this,
                promises;

            try {
                // The old master is valid?
                sjcl.decrypt(oldMasterPassword, passwords.get('firstObject.secret'));
            } catch (err) {
                this.set('wrongMasterPassword', true);
                return;
            }

            this.transitionToRoute('loading');

            passwords.forEach(function (password) {
                var plain, ciphered;

                try {
                    plain = sjcl.decrypt(oldMasterPassword, password.get('secret'));
                    ciphered = sjcl.encrypt(
                        newMasterPassword,
                        plain,
                        that.settings.getSetting('encryptOptions')
                    );
                    password.set('secret', ciphered);
                } catch (err) {
                    error = true;
                }
            });

            if (!error) {
                promises = passwords.map(function (password) {
                    return password.save();
                });
                Ember.RSVP.all(promises).then(function () {
                    that.transitionToRoute('passwords.index');
                });
            } else {
                passwords.forEach(function (password) {
                    password.rollbackAttributes();
                });
                this.transitionToRoute('change-master-password');
            }
        }
    }
});
