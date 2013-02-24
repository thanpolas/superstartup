/**
 * @fileoverview Handles user authentication.
 *
 */
goog.provide('ssd.user.Auth');
goog.provide('ssd.user.Auth.EventType');
goog.provide('ssd.user.Auth.Error');


goog.require('goog.async.Deferred');

goog.require('ssd.user.AuthModel');
goog.require('ssd.structs.DynamicMap');
goog.require('ssd.structs.Map');
goog.require('ssd.user.types');
goog.require('ssd.user.OwnItem');
goog.require('ssd.invocator');
goog.require('ssd.register');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ssd.user.AuthModel}
 */
ssd.user.Auth = function() {

  this.logger.info('ctor() :: Class instantiated');

  goog.base(this);

  // bubble user auth events to core.
  this.setParentEventTarget( ssd.core );

  /**
   * @type {boolean}
   * @private
   */
  this._isAuthed = false;

  /** @type {ssd.Config} */
  this.config = this._config.prependPath( ssd.user.Auth.CONFIG_PATH );

  /**
   * Config parameters
   */
  // if we'll check auth events of ext sources with our server
  this.config('performLocalAuth', false);

  // The var name to use when (ajax) posting the SOURCEID to the server
  // depends on 'performLocalAuth'
  this.config('localAuthSourceId', 'sourceId');

  // When performing a local authentication we pass the
  // access token to the server so he can validate the
  // authentication. This is the query parameter
  // name
  this.config('localAuthAccessToken', 'accessToken');

  // When an external auth source becomes authenticated
  // we use this URL to inform the server.
  // Depends on 'performLocalAuth'
  //
  // Auth plugins can overwrite this parameter
  this.config('localAuthUrl', '/users/verifyAuth');

  // When we get an authentication response from the server
  // Under which key / path do we expect the user data
  // object to be found?
  this.config('userKey', 'user');

  // In the user object, what is the name of the user's ID?
  this.config('userID', 'id');

  /**
   * performLocalAuth config parameter is used multiple times
   * we'll use this private symbol to assign it so it can get
   * compressed better by the compiler
   * @private
   * @type {boolean}
   */
  this._hasLocalAuth = false;

  /**
   * The user data object
   *
   * @type {ssd.user.OwnItem}
   * @private
   */
  this._user = new ssd.user.OwnItem();
  // pipe the user object events to this class
  this._user.addEventListener(ssd.structs.DynamicMap.EventType.BEFORE_SET,
    this._dataEvent, false, this);
  this._user.addEventListener(ssd.structs.DynamicMap.EventType.AFTER_SET,
    this._dataEvent, false, this);
  this._user.addEventListener(ssd.structs.DynamicMap.EventType.BEFORE_ADDALL,
    this._dataEvent, false, this);
  this._user.addEventListener(ssd.structs.DynamicMap.EventType.AFTER_ADDALL,
    this._dataEvent, false, this);

  // extend our data object with the own user key/value pairs
  this._user.addAll(ssd.user.types.ownuser);


  /**
   * This var contains an array of extSource ID
   * values, indicating that we are authed on these
   * external sources
   * @private
   * @type {ssd.structs.Map.<ssd.user.types.extSourceId, boolean>} bool is always true
   */
  this._extAuthedSources = new ssd.structs.Map();

  /**
   * This var contains a map of external sources.
   * The external Sources IDs will be used as keys and the
   * instanciations of the ext auth plugins as values
   * @private
   * @type {ssd.structs.Map.<ssd.user.types.extSourceId, Object>}
   */
  this._extSupportedSources = new ssd.structs.Map();

};
goog.inherits(ssd.user.Auth, ssd.user.AuthModel);


/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.Auth.CONFIG_PATH = 'user.auth';

/** @const {string} Identifies the module for the register */
ssd.user.Auth.MODULE_NAME = 'user.auth';

/**
 * Errors thrown by main external auth class.
 * @enum {string}
 */
ssd.user.Auth.Error = {
  /**
   * External auth plugin has already registered
   */
  ALREADY_REGISTERED: 'plugin already registered: '
};


/**
 * Events supported for the user auth module
 * @enum {string}
 */
ssd.user.Auth.EventType = {
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
  // own user data object piped events (piped from structs.DynamicMap)
  BEFORE_SET:    'user.data.beforeSet',
  AFTER_SET:     'user.data.afterSet',
  BEFORE_ADDALL: 'user.data.beforeAddall',
  AFTER_ADDALL:  'user.data.afterAddall'

};
goog.addSingletonGetter(ssd.user.Auth);

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.Auth.prototype.logger = goog.debug.Logger.getLogger('ssd.user.Auth');

/**
 * A custom getInstance method for the Auth class singleton.
 *
 * We want this custom method so as to return a proper
 * encapsulated instance that is binded (when invoked will
 * execute) the 'get' method.
 *
 *
 * !return {Function} The encapsulated instance.
 */
// ssd.user.Auth.getInstance = function() {
//   return ssd.user.Auth._instance ||
//     (ssd.user.Auth._instance = ssd.invocator(ssd.user.Auth, 'get'));
// };


ssd.user.Auth.prototype.get = function() {
  console.log('Yeashhhhh');
  console.log(this);
  return this._user.toObject();
};

/**
 * Kicks off authentication flows for all ext auth sources
 *
 * @return {goog.async.Deferred}
 */
ssd.user.Auth.prototype.init = function() {
  this.logger.info('init() :: starting...');

  var def = new goog.async.Deferred();
  def.callback();

  // shortcut assign the performLocalAuth config directive to our
  // local var
  this._hasLocalAuth = this.config('performLocalAuth');

  this.logger.config('init() :: Set "_hasLocalAuth" to value:' +
    this._hasLocalAuth);

  this._extSupportedSources.forEach( function( key, plugin ) {
    this.logger.config('init() :: Starting init for pluging:' + key);
    def.awaitDeferred( plugin.init() );
  }, this);

  return def;
};

/**
 * Listener for data change events in the own user data object
 *
 * We re-emit the event using this classes event types
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.Auth.prototype._dataEvent = function (e) {
  this.logger.config('_dataEvent() :: event triggered:' + e.type);
  var eventObj = {
    type: null,
    'parentEvent': e
  };

  switch(e.type) {
    case ssd.structs.DynamicMap.EventType.BEFORE_SET:
      eventObj.type = ssd.user.Auth.EventType.BEFORE_SET;
    break;
    case ssd.structs.DynamicMap.EventType.AFTER_SET:
      eventObj.type = ssd.user.Auth.EventType.AFTER_SET;
    break;
    case ssd.structs.DynamicMap.EventType.BEFORE_ADDALL:
      eventObj.type = ssd.user.Auth.EventType.BEFORE_ADDALL;
    break;
    case ssd.structs.DynamicMap.EventType.AFTER_ADDALL:
      eventObj.type = ssd.user.Auth.EventType.AFTER_ADDALL;
    break;
  }
  return this.dispatchEvent(eventObj);
};


/**
 * Registers an external authentication plugin.
 *
 * Right after registration, we start the initial auth check
 * for this source
 *
 * @param {!Object} selfObj the instance of the ext auth plugin
 * @return {void}
 */
ssd.user.Auth.prototype.addExtSource = function(selfObj) {
  this.logger.info('addExtSource() :: Adding auth source:' + selfObj.SOURCEID);

  // check if plugin is of right type
  if (!selfObj instanceof ssd.user.auth.PluginModule) {
    throw new TypeError();
  }
  // check if plugin already registered
  if (this._extSupportedSources.get(selfObj.SOURCEID)) {
    throw new Error(ssd.user.Auth.Error.ALREADY_REGISTERED + selfObj.SOURCEID);
  }

  // add the new plugin to our map
  this._extSupportedSources.set(selfObj.SOURCEID, selfObj);

  // register the plugin as a method in this instance
  this[selfObj.SOURCEID] = selfObj;

  // event listeners
  selfObj.addEventListener(ssd.user.Auth.EventType.INITIAL_AUTH_STATUS, this._initAuthStatus, false, this);
  selfObj.addEventListener(ssd.user.Auth.EventType.EXT_AUTH_CHANGE, this._authChange, false, this);
};


/**
 * Registration to Core
 *
 * @param {ssd.Core} ssdInst
 */
ssd.user.Auth.onRegisterRun = function( ssdInst ) {
  /**
   * The instance of the user auth class
   * @type {ssd.user.Auth}
   */
  ssdInst.user = new ssd.user.Auth();

  ssdInst.user.logger.info('onRegisterRun() :: Module Auth registers...');

  // initialize ext auth plugins
  ssd.register.runPlugins( ssd.user.Auth.MODULE_NAME );

  // register the init method
  ssd.register.init( ssdInst.user.init, ssdInst.user );

};
ssd.register.module( ssd.user.Auth.onRegisterRun );

