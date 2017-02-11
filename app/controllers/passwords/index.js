// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';
import debounce from '../../utils/debounce';

export default Ember.Controller.extend({
    allTags: Ember.computed('model.@each.tags', function () {
        var allTags = [];
        this.get('model').forEach(function (password) {
            var tags = password.get('tags');
            allTags = allTags.concat(tags);
        });
        return allTags.uniq().sort();
    }),

    completeDecipher: function (masterPassword) {
        var data = this.get('passwordToDecipherData'),
            secret;

        try {
            secret = sjcl.decrypt(masterPassword, data.password);
        } catch (err) {
            this.set('errorMessage', 'Wrong master password');
            return;
        }
        masterPassword = null;
        data.callback(secret);
    },

    updateFilter: Ember.observer('searchText', debounce(function () {
        this.set('filterText', this.get('searchText'));
    }, 500)),

    filteredPasswords: Ember.computed('filterText', 'activeTags', 'model', function () {
        var passwords = this.get('model'),
            activeTags = this.get('activeTags'),
            query = this.get('searchText').toLowerCase(),
            searchTexts = query.split(' ');

        if (activeTags.length === 0 && query.length === 0) {
            return passwords.sortBy('service');
        }

        return passwords.filter(function (password) {
            var include = false,
                tags = password.get('tags'),
                service = password.get('service').toLowerCase(),
                account = password.get('account').toLowerCase(),
                notes = password.get('notes').toLowerCase();

            if (activeTags.length > 0) {
                include = include || tags.any(function (text) {
                    return activeTags.contains(text);
                });
            }

            searchTexts.forEach(function (searchText) {
                if (!include && searchText.length > 0) {
                    if (!Ember.isNone(service)) {
                        include = include || service.indexOf(searchText) >=0;
                    }
                    if (!Ember.isNone(account)) {
                        include = include || account.indexOf(searchText) >=0;
                    }
                    if (!Ember.isNone(notes)) {
                        include = include || notes.indexOf(searchText) >=0;
                    }
                }
            });

            return include;
        }).sortBy('service');
    }),

    onePassword: Ember.computed('model.[]', function () {
        return this.get('model.firstObject');
    }),

    actions: {
        toggleTag: function (text) {
            var activeTags = this.get('activeTags'),
                remove = activeTags.contains(text);

            if (remove) {
                this.set('activeTags', activeTags.without(text));
            } else {
                activeTags.push(text);
                this.set('activeTags', activeTags.uniq());
            }
        },

        toggleRememberMaster: function (newValue) {
            this.get('settings').setSetting('rememberMasterPassword', newValue);
            if (!newValue) {
                window.yithMasterPassword = null;
            }
        },

        decipher: function (password, callback) {
            this.set('passwordToDecipherData', {
                password: password,
                callback: callback
            });
            // 1. Check if the master password is in memory
            if (!Ember.isNone(window.yithMasterPassword)) {
                // 2a. Decipher password
                this.completeDecipher(window.yithMasterPassword);
            } else {
                // 2b. If not, ask for it
                this.set('requestMasterPassword', true);
            }
        },

        sendMasterPassword: function (masterPassword) {
            // 3. Decipher password
            var settings = this.get('settings');

            this.set('requestMasterPassword', false);
            if (settings.getSetting('rememberMasterPassword')) {
                window.yithMasterPassword = masterPassword;
                setTimeout(function () {
                    window.yithMasterPassword = null;
                }, 600000); // 10 min
            }
            this.completeDecipher(masterPassword);
        }
    }
});
