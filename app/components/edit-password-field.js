// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';
import passwordGenerator from 'yith-responsive-client/utils/passwordGenerator';

export default Ember.Component.extend({
    pwstrengthOptions: {
        rules: {
            activated: {
                wordTwoCharacterClasses: true,
                wordRepetitions: true
            }
        },
        ui: {
            showVerdictsInsideProgressBar: true,
            container: '#password-edit-field',
            viewports: {
                progress: '#password-strength-meter'
            }
        }
    },

    didInsertElement: function () {
        Ember.$('input[name="password1"]').pwstrength(this.pwstrengthOptions);
    },

    invalid: false,

    validate: Ember.observer('password1', 'password2', function () {
        var password = this.get('password1'),
            same = password === this.get('password2');

        if (!same) {
            this.set('invalid', true);
        } else {
            this.set('invalid', false);
            this.sendAction('action', password);
        }
    }),

    showGeneratorOptions: false,

    actions: {
        showOptions: function () {
            this.set('showGeneratorOptions', true);
        },

        generatePassword: function () {
            var settings = this.get('settings'),
                password = passwordGenerator.generate(settings);
            // TODO

            this.set('password1', password);
            this.set('password2', password);
            password = null;
        }
    }
});
