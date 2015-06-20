// Copyright (c) 2015 Lorenzo Gil
// MIT License

import AuthManager from '../utils/authmanager';

export default {
    name: 'authManager',

    initialize: function (container, application) {
        application.register('authmanager:main', AuthManager);

        application.inject('controller', 'authManager', 'authmanager:main');
    }
};
