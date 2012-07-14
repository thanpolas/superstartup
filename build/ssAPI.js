/**
 * A scafolding of the superstartup API
 *
 * Draw a typical flow of initialization
 */

// the main class, does ???
ss();

// Give the go ahead to boot up
//    - check auth status of ext auth plugins
//    - lazy load required libs
ss.init();

// check auth status
ss.isAuthed();

/**
 * USER AUTHENTICATION
 */
// auth a user with given data object
ss.user.auth(userObj);
// login a user natively, opt_data is arbitrary dat to pass to server
ss.user.login(username, password, perm, callback, opt_data);
// logout
ss.user.logout(opt_callback);

/**
 * USER MANIPULATION
 * of currently logged in user
 */
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

/**
 * EXTERNAL AUTH SOURCES
 */
// returns an array of strings with the supported external auth sources
// we will name them 'sourceId'
ss.user.getExtSources();
// check if authed with specified source
ss.user.isExtAuthed(sourceId);
// return the singleton instance of the specified source
// we'll name it 'ext'
ss.user.getExt(sourceId);

ext.isAuthed();
// get the raw data object as passed from ext Source
ext.getUser();
// returns the string literal of the sourceId
ext.sourceId();


/**
 * OTHER USERS
 */
// load other users
ss.users.criteria({'id': [1,2,3]}).links('address').get(fn);



// set configuration
ss.config.set('user.auth.param', b);

// optionally, hook to server2js
ss.server(str, fn);
// server interfaces with
ss.server.server(str, obj);

// listen on events
ss.addEventListener(eventType, listener);



