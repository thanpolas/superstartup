# Superstartup API Scaffolding

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

Loading other users will rely heavily on the server's API. This part of the library will be optional. Will provide 2 basic layers of functionality:

1. Delegating the REST API. Act as a cache container, storing every data object (user) which can be later queried with a rich expression format.
2. Full stack operation. Achieving configurability of internal REST API to match the server's API.

```javascript
// load the small data object of a set of users
// based on given criteria
ss.users.criteria({'id': [1,2,3]}).type('small').get(callback());

// Callback will return an array of user objects, we'll name then u
// get current user's complete data object
u() === u.get() === u.toObject();
// get a specific param of user
u('id') === u.get('id');
```

## Metrics System

### Metadata Library

The metadata library is the bridge between the current visitor [and or user] and metrics.

### Analytics

Thin wrappers for analytics services.

```javascript
// track an event
ss.metrics.trackEvent(category, action, opt_label, opt_value);
// track a page view
ss.metrics.trackPageview(opt_pageURL);
// Track an arbitrary event and save it to OUR server
ss.metrics.trackMetrics(category, action, opt_label, opt_value, opt_value2, /*...*/);
// A custom method that applies only to a specific analytics driver
ss.metrics.mixpanel.nameTag(nameId);
```

## Social System

The social systems implement known features of popular social networks in the form of plugins.

```javascript
// get a FB like button
ss.social.fb.getLikeButton(url, opt_params, opt_width);

// create a FB post
var post = new ss.social.fb.Post();
// set params
post.setParams({picture: picUrl, caption: picCaption, link: picLink});
// don't allow edit before post
post.setEditBeforePost(false);
// go
post.perform();
```

## Helper Functions & Components

```javascript
// set configuration
ss.config.set('user.auth.param', b);

// optionally, hook to server2js
ss.server.hook(str, fn);
// server interfaces with
ss.server(str, obj);
```

