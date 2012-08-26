# SuperStartup Configs

## User Module

### General

user.auth.performLocalAuth {boolean}
// The var name to use when (ajax) posting the SOURCEID to the server
// depends on 'performLocalAuth'
user.auth.localAuthSourceId {string}
// When performing a local authentication we pass the
// access token to the server so he can validate the
// authentication. This is the query parameter
// name
user.auth.localAuthAccessToken {string}
// When an external auth source becomes authenticated
// we use this URL to inform the server.
// Depends on 'performLocalAuth'
//
// Auth plugins can overwrite this parameter
user.auth.localAuthUrl {string}


### Facebook

this.config('appId', '');
this.config('permissions', '');
// If this is set to false, we assume that the FB JS API was loaded
// synchronously
this.config('loadFBjsAPI', true);
this.config('jsAPI', 'connect.facebook.net/en_US/all.js');
this.config('jsAPIdebug', 'static.ak.fbcdn.net/connect/en_US/core.debug.js');
