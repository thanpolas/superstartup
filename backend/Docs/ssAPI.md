# Scafolding of the superstartup API

## Core functions
```javascript
// the main class, does ???
ss();

// Give the go ahead to boot up
//    - check auth status of ext auth plugins
//    - lazy load required libs
ss.init();

// check auth status
ss.isAuthed();
```

## User system

The main dish of the superstartup library.

### User Authentication

```javascript
// auth a user with given data object
ss.user.auth(userObj);
// login a user natively, opt_data is arbitrary dat to pass to server
ss.user.login(username, password, perm, callback, opt_data);
// logout
ss.user.logout(opt_callback);
```

### User Manipulation

```javascript
// get current user's complete data object
ss.user() === ss.user.get() === ss.user.toObject();
// get a specific param of user
ss.user('id') === ss.user.get('id');
// set a value, each set forces a server POST
ss.user(a, b, opt_callback) === ss.user.set(a, b, opt_callback);
// don't update
ss.user.set(a, b, false);
// perform a save
ss.user.save(opt_callback);
```

### External Auth Sources
```javascript
// returns an array of strings with the supported external auth sources
// we will name them 'sourceId'
ss.user.getExtSources();
// check if authed with specified source
ss.user.isExtAuthed(sourceId);
// return the singleton instance of the specified source
// we'll name it 'ext'
ss.user.getExt(sourceId);
// return boolean
ext.isAuthed();
// perform login with this service
ext.login(opt_callback, opt_perms);
// prefer the global logout
ext.logout(opt_callback);
// get the raw data object as passed from ext Source
ext.getUser();
// returns the string literal of the sourceId
ext.sourceId();
```

### Other Users

```javascript
// load other users
ss.users.criteria({'id': [1,2,3]}).links('address').get(callback());

// Callback will return an array of user objects, we'll name then u
// get current user's complete data object
u() === u.get() === u.toObject();
// get a specific param of user
u('id') === u.get('id');
```

## Helper Functions

```javascript
// set configuration
ss.config.set('user.auth.param', b);

// optionally, hook to server2js
ss.server.hook(str, fn);
// server interfaces with
ss.server(str, obj);
```

