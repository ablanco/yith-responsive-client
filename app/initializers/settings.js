// Copyright (c) 2015 Lorenzo Gil
// MIT License

import Settings from '../utils/settings';

export default {
    name: 'settings',

    initialize: function (container, application) {
        application.register('settings:main', Settings);

        application.inject('route', 'settings', 'settings:main');
        application.inject('controller', 'settings', 'settings:main');
    }
};
