// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    tagsAsString: Ember.computed('tags', function () {
        if (Ember.isEmpty(this.get('tags'))) { return ''; }
        return this.get('tags').join(', ');
    }),

    didInsertElement: function () {
        var $el = this.$('input'),
            that = this;

        $el.tagsinput();
        $el.on('itemAdded', function (evt) {
            var tags = [];
            if (!Ember.isEmpty(that.get('tags'))) {
                tags = that.get('tags').copy();
            }
            tags.push(evt.item.trim());
            that.set('tags', tags);
            that.sendAction('action', tags);
        });
        $el.on('itemRemoved', function (evt) {
            // We are removing so there should already be tags
            var tags = that.get('tags').copy();
            tags = tags.without(evt.item.trim());
            that.set('tags', tags);
            that.sendAction('action', tags);
        });
    }
});
