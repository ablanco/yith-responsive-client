// Copyright (c) 2016 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    didInsertElement: function () {
        var that = this;
        this.$('input[data-toggle=switch]').bootstrapSwitch({
            onSwitchChange: function (evt, value) {
                that.sendAction('action', value);
            }
        });
    }
});
