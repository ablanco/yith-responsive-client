// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    tagsAsString: Ember.computed('tags', function () {
        return this.get('tags').join(', ');
    }),

    didInsertElement: function () {
        var $el = this.$('input'),
            that = this;

        $el.tagsinput();
        $el.on('itemAdded', function (evt) {
            var tags = that.get('tags').copy();
            tags.push(evt.item.trim());
            that.set('tags', tags);
            that.sendAction('action', tags);
        });
        $el.on('itemRemoved', function (evt) {
            var tags = that.get('tags').copy();
            tags = tags.without(evt.item.trim());
            that.set('tags', tags);
            that.sendAction('action', tags);
        });
    }
});
