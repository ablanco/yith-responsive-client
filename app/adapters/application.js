// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

import DS from 'ember-data';
import ENV from 'yith-responsive-client/config/environment';

export default DS.RESTAdapter.extend({
    host: ENV.defaults.serverBaseUrl,

    ajax: function (url, type, hash) {
        // Prepare the adapter for the oAuth stuff
        url += '?client_id=' + this.settings.getSetting('clientId');
        if (hash === undefined) {
            hash = {};
        }
        hash.crossDomain = true;
        this.authManager.loadToken();
        hash.headers = {
            'Authorization': 'Bearer ' + this.authManager.get('accessToken')
        };
        return this._super(url, type, hash);
    },

    didError: function () {
        // eslint-disable-next-line no-console
        console.error(arguments);
    }
});
