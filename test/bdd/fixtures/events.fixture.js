
/**
 * @fileOverview All the events emitted by the superstartup library.
 */
goog.provide('ssd.test.fixture.event');

/**
 * @enum {string} Core events emitted.
 */
ssd.test.fixture.event.core = {
  INIT: 'ss.init'
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
  // before ext source local auth
  BEFORE_EXT_LOCAL_AUTH: 'user.beforeExtLocalAuth',
  // before local auth
  BEFORE_LOCAL_AUTH: 'user.beforeLocalAuth',
  // before we process the response object from the AJAX callback
  // of an authentication operation with local server
  ON_AUTH_RESPONSE: 'user.onAuthResponse',
  AFTER_AUTH_RESPONSE: 'user.afterAuthResponse',
  // After the auth response has been processed
  AUTH_RESPONSE: 'user.authResponse',
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
