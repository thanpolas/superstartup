/**
 * A scafolding of the superstartup API
 * 
 * Draw a typical flow of initialization
 */
 
// the main class, does ???
ss();

// set configuration
ss.config.set('user.auth.param', b);

// set mappings
ss.mappings.set(a, b);

// optionally, hook to server2js
ss.server2js(str, fn);
// server interfaces with
ss.server2js.server(str, obj);

// listen on events
ss.addEventListener(eventType, listener);

// Give the go ahead to boot up
//    - check auth status of ext auth plugins
//    - lazy load required libs
ss.init();

// check auth status
ss.isAuthed();


/**
 * USER SYSTEM
 */
// auth a user with given data object
ss.user.auth();
// get current user complete data object
ss.user() === ss.user.get() === ss.user.toObject();
// get a specific param of user
ss.user('id') === ss.user.get('id');
// set a value, each set forces a server request, with a clawback on fail
ss.user.set(a, b);
// don't update
ss.user.set(a, b, false);
// perform a save
ss.user.save();


// load other users
ss.users.criteria({'id': [1,2,3]}).links('address').get(fn);

