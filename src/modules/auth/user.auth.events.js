/**
 * Events emmited by the module.
 */
goog.provide('ssd.user.auth.EventType');

/**
 * Events supported for the user auth module
 * @enum {string}
 */
ssd.user.auth.EventType = {
  // An external auth source has an auth change event
  // (from not authed to authed and vice verca)
  EXT_AUTH_CHANGE: 'user.extAuthChange',
  // We have a global auth change event
  // (from not authed to authed and vice verca)
  // use this eventype for authoritative changes
  AUTH_CHANGE: 'user.authChange',
  // When all initial auth states from all sources have reported in
  // trigget this one event.
  INITIAL_AUTH_STATE: 'user.initialAuthState',
  // the auth status from an ext source
  INITIAL_EXT_AUTH_STATE: 'user.initialExtAuthState',
  // Triggers if authed user is new, first time signup
  NEWUSER: 'user.newUser',
  // before ext source local auth
  BEFORE_EXT_LOCAL_AUTH: 'user.beforeExtLocalAuth',
  // Before local Auth
  BEFORE_LOCAL_AUTH: 'user.beforeLocalAuth',
  // before we process the response object from the AJAX callback
  // of an authentication operation with local server
  ON_AUTH_RESPONSE: 'user.onAuthResponse',

  AFTER_AUTH_RESPONSE: 'user.afterAuthResponse',

  // own user data object before validating it's ok
  USERDATA_BEFORE_VALIDATE: 'user.data.beforeValidate',
  // own user data object piped events (piped from structs.DynamicMap)
  BEFORE_SET:    'user.data.beforeSet',
  AFTER_SET:     'user.data.afterSet',
  BEFORE_ADDALL: 'user.data.beforeAddall',
  AFTER_ADDALL:  'user.data.afterAddall'
};
