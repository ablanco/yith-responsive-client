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
        return allTags.uniq();
    }),

    completeDecipher: function (masterPassword) {
        debugger;
        var data = this.get('passwordToDecipherData'),
            secret = sjcl.decrypt(masterPassword, data.password);
        data.callback(secret);
    },

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
            debugger;
            this.set('requestMasterPassword', false);
            // TODO save temporal copy of the masterPassword if necessary
            this.completeDecipher(masterPassword);
        }
    }
});
