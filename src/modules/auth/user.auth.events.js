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
  // {authState: boolean}
  AUTH_CHANGE: 'user.authChange',

  // When all initial auth states from all sources have reported in
  // trigget this one event.
  INITIAL_AUTH_STATE: 'user.initialAuthState',

  // the auth status from an ext source
  INITIAL_EXT_AUTH_STATE: 'user.initialExtAuthState',

  // Triggers if authed user is new, first time signup
  NEWUSER: 'user.newUser',

  // before a login operation with an external plugin starts.
  // {source: string}
  BEFORE_EXT_LOGIN: 'user.beforeExtLogin',
  // When external auth plugin source responds
  // {ssd.user.auth.plugin.Response}
  ON_EXT_OAUTH: 'user.onExtOauth',

  // before ext source local auth
  BEFORE_EXT_LOCAL_AUTH: 'user.beforeExtLocalAuth',


  // Before local Auth
  // {data: Object}
  BEFORE_LOGIN: 'user.beforeLogin',
  // before logout
  BEFORE_LOGOUT: 'user.beforeLogout',

  // before we process the response object from the AJAX callback
  // of an authentication operation with local server
  ON_LOGIN_RESPONSE: 'user.onLoginResponse',
  ON_LOGOUT_RESPONSE: 'user.onLogoutResponse',

  AFTER_LOGIN_RESPONSE: 'user.afterLoginResponse',
  AFTER_LOGOUT_RESPONSE: 'user.afterLogoutResponse',

  // udo before validating it's ok
  USERDATA_BEFORE_VALIDATE: 'user.udo.beforeValidate',

  // own udo piped events (piped from structs.DynamicMap)
  BEFORE_SET:    'user.udo.beforeSet',
  AFTER_SET:     'user.udo.afterSet',
  BEFORE_ADDALL: 'user.udo.beforeAddall',
  AFTER_ADDALL:  'user.udo.afterAddall'
};
