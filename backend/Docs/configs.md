# SuperStartup Configs

## Core

  // The default key we will use to determine
  // success or failure of an AJAX request
  //
  // This key is expected to exist in all the responses
  // from the server
  //
  // This key can be overwritten by any module
  //
  // If you set this key to null then it will not be used
  // and we'll assume that once a response callback is
  // triggered it is considered successful by default.
  core.status: 'status');

  // The true value of this key.
  //
  // Typically this is boolean true, however this
  // may not be the case for everyone.
  //
  // This key can be overwritter by any module
  core.statusTrue: true);

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

  // When we get an authentication response from the server
  // Under which key / path do we expect the user data
  // object to be found?
  user.auth.localAuthUrl.userKey', 'user');

  // In the user object, what is the name of the user's ID?
  user.auth.localAuthUrl.userID', 'id');

### Facebook

this.config('appId', '');
this.config('permissions', '');
// If this is set to false, we assume that the FB JS API was loaded
// synchronously
this.config('loadFBjsAPI', true);
this.config('jsAPI', 'connect.facebook.net/en_US/all.js');
this.config('jsAPIdebug', 'static.ak.fbcdn.net/connect/en_US/core.debug.js');
