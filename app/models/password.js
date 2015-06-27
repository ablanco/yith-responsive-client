// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import DS from 'ember-data';

export default DS.Model.extend({
    account: DS.attr('string'),
    creation: DS.attr(),
    expiration: DS.attr(),
    lastModification: DS.attr(),
    notes: DS.attr('string'),
    owner: DS.attr(),
    secret: DS.attr('string'),
    service: DS.attr('string'),
    tags: DS.attr()
});
