// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/* global Clipboard */

import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return this.store.findAll('password');
    },

    setupController: function (controller, model) {
        var settings = this.get('settings');

        controller.set('model', model);
        controller.set('requestMasterPassword', false);
        controller.set('rememberMaster',
                       settings.getSetting('rememberMasterPassword'));
        controller.set('searchText', '');
        controller.set('filterText', '');
        controller.set('activeTags', []);
    },

    renderTemplate: function () {
        Ember.run.scheduleOnce('afterRender', this, function () {
            Ember.$('button[data-toggle=popover]').popover();
            new Clipboard('.clipboard');
        });
        this._super();
    },

    actions: {
        willTransition: function () {
            Ember.$('button[data-toggle=popover]').popover('hide');
            return true;
        }
    }
});
