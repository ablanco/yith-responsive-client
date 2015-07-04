// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import Ember from 'ember';

export default Ember.Component.extend({
    isBeingShown: false,
    passwordPlain: '',

    actions: {
        showPassword: function () {
            console.log(this.get('password.service'));
        }
    }
});
