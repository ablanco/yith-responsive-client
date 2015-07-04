// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    showModal: Ember.observer('flag', function () {
        if (this.get('flag')) {
            debugger;
            this.set('masterPassword', '');
            // TODO show modal
        }
    }),

    actions: {
        sendToController: function () {
            this.sendAction('sendMasterPassword', this.get('masterPassword'));
        }
    }
});
