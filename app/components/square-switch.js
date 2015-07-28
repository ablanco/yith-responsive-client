// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['bootstrap-switch-square'],

    didInsertElement: function () {
        Ember.$('#square-switch-' + this.get('ident')).bootstrapSwitch();
    }
});
