// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.View.extend({
    templateName: 'password-viewer-countdown',

    isBeingShown: false,
    passwordPlain: '',

    click: function (evt) {
        if (!Ember.$(evt.target).is('button')) { return; }
        evt.preventDefault();

        // TODO
    }
});
