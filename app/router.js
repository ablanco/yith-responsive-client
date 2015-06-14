// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
    location: config.locationType
});

Router.map(function() {
    this.route('index', {
        path: '/'
    });
    this.route('tos');

    this.resouce('passwords', {
        path: '/passwords/'
    }, function () {
        this.route('new');
        this.route('edit', {
            path: '/edit/:password_id'
        });
    });
});

export default Router;
