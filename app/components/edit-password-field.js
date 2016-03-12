// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';
import generatePassword from 'yith-responsive-client/utils/passwordGenerator';

export default Ember.Component.extend({
    didInsertElement: function () {
        var options = this.settings.getSetting('pwstrengthOptions');
            options.ui.container = '#password-edit-field';
        Ember.$('input[name="password1"]').pwstrength(options);
    },

    invalid: false,

    inputType: 'password',

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

    passGenLength: Ember.computed('settings', {
        get() {
            return this.get('settings').getSetting('passGenLength');
        },
        set(key, value) {
            this.get('settings').setSetting(key, parseInt(value, 10));
        }
    }),

    updatePassGenOption: function (name) {
        var settings = this.get('settings');

        settings.setSetting(name, !settings.getSetting(name));
        this.notifyPropertyChange('settings');
        this.recreatePassGenCheckboxes();
    },

    recreatePassGenCheckboxes: function () {
        var settings = this.get('settings'),
            that = this;

        Ember.$('.pass-gen-checkboxes label.checkbox input').radiocheck('destroy');
        Ember.$('.pass-gen-checkboxes label.checkbox input').remove();

        [
            'passGenUseChars',
            'passGenUseNumbers',
            'passGenUseSymbols'
        ].forEach(function (name) {
            var value = settings.getSetting(name),
                action = value ? 'check' : 'uncheck',
                input = '<input type="checkbox">';

            Ember.$('label.' + name).prepend(input);
            Ember.$('label.' + name + ' input').radiocheck();
            Ember.$('label.' + name + ' input').radiocheck(action);
            Ember.$('label.' + name + ' input').on('change', function () {
                that.updatePassGenOption(name);
            });
        });
    },

    actions: {
        showOptions: function () {
            var that = this;

            this.set('showGeneratorOptions', true);
            Ember.run.scheduleOnce('afterRender', this, function () {
                that.recreatePassGenCheckboxes();
            });
        },

        generatePassword: function () {
            var settings = this.get('settings'),
                password = generatePassword(settings);

            this.set('password1', password);
            this.set('password2', password);
            password = null;
            Ember.run.scheduleOnce('afterRender', this, function () {
                Ember.$('input[name=password1]').trigger('keyup');
            });
        },

        previewPassword: function () {
            var currentInput = this.get('inputType'),
                newInput;

            if (currentInput === 'text') {
                newInput = 'password';
            } else {
                newInput = 'text';
            }

            this.set('inputType', newInput);
        }
    }
});
