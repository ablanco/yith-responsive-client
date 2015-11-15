// Copyright (c) 2015 Lorenzo Gil
// MIT License

import AuthManager from '../utils/authmanager';

export default {
    name: 'authManager',

    initialize: function (application) {
        application.register('authmanager:main', AuthManager);

        application.inject('controller', 'authManager', 'authmanager:main');
        application.inject('route', 'authManager', 'authmanager:main');
        application.inject('adapter', 'authManager', 'authmanager:main');
    }
};
