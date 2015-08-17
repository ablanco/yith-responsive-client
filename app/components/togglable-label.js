// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    status: false,

    statusClass: Ember.computed('status', function () {
        if (this.get('status')) {
            return 'active';
        }
        return 'inactive';
    }),

    actions: {
        toggle: function () {
            this.set('status', !this.get('status'));
            this.sendAction('action', this.get('text'));
        }
    }
});
