
/**
 * @fileOverview All the events emitted by the superstartup library.
 */
goog.provide('ssd.test.fixture.event');

/**
 * @enum {string} Core events emitted.
 */
ssd.test.fixture.event.core = {
  INIT: 'init'
};

/**
 * @enum {string} events emitted by the user module.
 */
ssd.test.fixture.event.user = {

  /**
   * ********************************************
   * USER MODULE EVENTS
   * ********************************************
   */
  // An external auth source has an auth change event
  // (from not authed to authed and vice verca)
  EXT_AUTH_CHANGE: 'user.extAuthChange',
  // We have a global auth change event
  // (from not authed to authed and vice verca)
  // use this eventype for authoritative changes
  AUTH_CHANGE: 'user.authChange',
  // Trigger this event as soon as we can resolve
  // the auth status from an ext source
  INITIAL_AUTH_STATE: 'user.initialAuthState',
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
  // before local auth
  BEFORE_LOGIN: 'user.beforeLogin',

  // before logout
  BEFORE_LOGOUT: 'user.beforeLogout',
  ON_LOGOUT_RESPONSE: 'user.onLogoutResponse',
  AFTER_LOGOUT_RESPONSE: 'user.afterLogoutResponse',

  // before we process the response object from the AJAX callback
  // of an authentication operation with local server
  ON_LOGIN_RESPONSE: 'user.onLoginResponse',
  // After the auth response has been processed
  AFTER_LOGIN_RESPONSE: 'user.afterLoginResponse',
  // Current authed UDO events (piped from DynamicMap)
  BEFORE_SET:    'user.data.beforeSet',
  AFTER_SET:     'user.data.afterSet',
  BEFORE_ADDALL: 'user.data.beforeAddall',
  AFTER_ADDALL:  'user.data.afterAddall'
};

// facebook specific events
ssd.test.fixture.event.user.facebook = {
  JSAPILOADED: 'user.fb.jsAPIloaded',
  INITIAL_AUTH_STATUS: 'user.fb.initialAuthStatus'
};
