// Copyright (c) 2016 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return this.store.findAll('password');
    }
});
