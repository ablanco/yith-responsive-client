// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    click: function (evt) {
        var $target = Ember.$(evt.target);

        if ($target.is('.ask-confirmation')) {
            Ember.$('.ask-confirmation-modal')
                 .modal({ show: false }).modal('show');
        } else if ($target.is('.ask-confirmation-modal .confirm')) {
            Ember.$('.ask-confirmation-modal').modal('hide');
            this.sendAction('action');
        }
    }
});
