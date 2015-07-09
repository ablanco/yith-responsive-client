// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    isBeingShown: false,

    renderPassword: function (secret) {
        this.set('passwordPlain', secret);
        this.set('countdown', 5);
        this.set('isBeingShown', true);

        var that = this,
            callback;

        callback  = function () {
            var countdown = that.get('countdown');

            if (countdown > 0) {
                that.set('countdown', countdown - 1);
                window.setTimeout(callback, 1000);
            } else {
                that.set('passwordPlain', '');
                that.set('isBeingShown', false);
            }
        };
        window.setTimeout(callback, 1000);
    },

    actions: {
        showPassword: function () {
            var that = this;

            this.sendAction(
                'action',
                this.get('password.secret'),
                function () {
                    that.renderPassword.apply(that, arguments);
                }
            );
        }
    }
});
