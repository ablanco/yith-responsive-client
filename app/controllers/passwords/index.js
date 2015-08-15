// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';

export default Ember.ArrayController.extend({
    allTags: Ember.computed('@each.tags', function () {
        var allTags = [];
        this.forEach(function (password) {
            var tags = password.get('tags');
            allTags = allTags.concat(tags);
        });
        return allTags.uniq().map(function (tag, index) {
            return {
                text: tag,
                index: index
            };
        });
    }),

    completeDecipher: function (masterPassword) {
        var data = this.get('passwordToDecipherData'),
            secret;

        try {
            secret = sjcl.decrypt(masterPassword, data.password);
        } catch (err) {
            // TODO
        }
        data.callback(secret);
    },

    filteredPasswords: Ember.computed('searchText', '@each', function () {
        var passwords = this.get('model'),
            searchText = this.get('searchText');

        if (searchText.length === 0) { return passwords; }

        return passwords.filter(function (password) {
            var include = false,
                service = password.get('service'),
                account = password.get('account'),
                notes = password.get('notes');

            if (!Ember.isNone(service)) {
                include = include || service.indexOf(searchText) >=0;
            }
            if (!Ember.isNone(account)) {
                include = include || account.indexOf(searchText) >=0;
            }
            if (!Ember.isNone(notes)) {
                include = include || notes.indexOf(searchText) >=0;
            }

            return include;
        });
    }),

    actions: {
        decipher: function (password, callback) {
            this.set('passwordToDecipherData', {
                password: password,
                callback: callback
            });
            // TODO
            // 1. Check if the masterPassword is in memory
            // 2. If not, ask for it
            this.set('requestMasterPassword', true);
            // 3. Decipher password
        },

        sendMasterPassword: function (masterPassword) {
            this.set('requestMasterPassword', false);
            // TODO save temporal copy of the masterPassword if necessary
            this.completeDecipher(masterPassword);
        }
    }
});
