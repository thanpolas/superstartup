
/**
 * @fileOverview All the events emitted by the superstartup library.
 */
goog.provide('ssd.test.event.all');

/**
 * @enum {string} Core events emitted.
 */
ssd.test.event.core = {
  INIT: 'ss.init'
};

/**
 * @enum {string} events emitted by the user module.
 */
ssd.test.event.user = {

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
  INITIAL_AUTH_STATUS: 'user.initialAuthStatus',
  // Triggers if authed user is new, first time signup
  NEWUSER: 'user.newUser',
  // before local auth
  BEFORE_LOCAL_AUTH: 'user.beforeLocalAuth',
  // before we process the response object from the AJAX callback
  // of an authentication operation with local server
  BEFORE_AUTH_RESPONSE: 'user.beforeAuthResponse',
  // After the auth response has been processed
  AUTH_RESPONSE: 'user.authResponse',
  // own user data object before validating it's ok
  USERDATA_BEFORE_VALIDATE: 'user.data.beforeValidate',
  // own user data object piped events (piped from DynamicMap)
  BEFORE_SET:    'user.data.beforeSet',
  AFTER_SET:     'user.data.afterSet',
  BEFORE_ADDALL: 'user.data.beforeAddall',
  AFTER_ADDALL:  'user.data.afterAddall'
};