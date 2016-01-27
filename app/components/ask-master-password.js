// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global sjcl */

import Ember from 'ember';

export default Ember.Component.extend({
    errorMessage: '',

    showModal: Ember.observer('flag', function () {
        var that = this,
            $modal;

        if (this.get('flag')) {
            this.set('masterPassword', '');
            $modal = Ember.$('#master-password-modal').modal({
                show: false
            });
            $modal.off('hidden.bs.modal').on('hidden.bs.modal', function () {
                that.set('flag', false);
            });
            $modal.off('shown.bs.modal').on('shown.bs.modal', function () {
                $modal.find('input').focus();
            });
            $modal.modal('show');
        }
    }),

    actions: {
        sendToController: function () {
            var testPassword = this.get('testPassword');

            if (!Ember.isNone(testPassword)) {
                try {
                    sjcl.decrypt(this.get('masterPassword'),
                                 testPassword.get('secret'));
                } catch (err) {
                    this.set('errorMessage', 'Wrong master password');
                    Ember.$('#master-password-modal input').select();
                    return;
                }
            }
            this.set('errorMessage', '');

            Ember.$('#master-password-modal').modal('hide');
            this.sendAction('action', this.get('masterPassword'));
        }
    }
});
