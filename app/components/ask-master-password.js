// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
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
            $modal.modal('show');
            $modal.find('input').focus();
        }
    }),

    actions: {
        sendToController: function () {
            Ember.$('#master-password-modal').modal('hide');
            this.sendAction('action', this.get('masterPassword'));
        }
    }
});
