/**
 * @fileoverview Handles user authentication.
 *
 */
goog.provide('ssd.user.Auth');
goog.provide('ssd.user.Auth.Error');

goog.require('goog.async.Deferred');

goog.require('ssd.user.AuthModel');
goog.require('ssd.user.AuthLogin');

goog.require('ssd.structs.DynamicMap');
goog.require('ssd.structs.Map');
goog.require('ssd.user.types');
goog.require('ssd.user.OwnItem');
goog.require('ssd.invocator');
goog.require('ssd.register');
goog.require('ssd.invocator');
goog.require('ssd.user.auth.EventType');

/**
 * User authentication class
 *
 * @param {ssd.Core} ssdInst [description]
 * @constructor
 * @extends {ssd.user.AuthLogin}
 */
ssd.user.Auth = function( ssdInst ) {

  this.logger.info('ctor() :: Instantiating Auth module...');

  goog.base(this);

  /**
   * @type {ssd.Core}
   */
  this._ssdInst = ssdInst;

  /** @type {ssd.Config} */
  this.config = this._config.prependPath( ssd.user.auth.ConfigKeys.CONFIG_PATH );

  /**
   * Config parameters
   */
  // if we'll check auth events of ext sources with our server
  this.config('performLocalAuth', false);

  // The var name to use when (ajax) posting the SOURCEID to the server
  // depends on 'performLocalAuth'
  this.config(ssd.user.auth.ConfigKeys.PARAM_SOURCE_ID, 'sourceId');

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
  // Set to null when response root is the udo.
  this.config(ssd.user.auth.ConfigKeys.RESPONSE_KEY_UDO, null);

  // In the user object, what is the name of the user's ID?
  this.config('userId', 'id');

  return ssd.invocator.encapsulate(this, this._dynmapUdo.getSet);

};
goog.inherits(ssd.user.Auth, ssd.user.AuthLogin);
goog.addSingletonGetter(ssd.user.Auth);

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.Auth.prototype.logger = goog.debug.Logger.getLogger('ssd.user.Auth');

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
 * Defines the storage structure for registered auth plugins.
 *
 * @typedef {{
 *   sourceId        : string,
 *   inst            : Object,
 *   initAuthStatus  : boolean,
 *   isAuthed        : boolean
 *   }}
 */
ssd.user.Auth.SourceItem;

/**
 * Kicks off authentication flows for all ext auth sources
 *
 * @return {goog.async.Deferred}
 */
ssd.user.Auth.prototype.init = function() {
  this.logger.info('init() :: starting...');

  // shortcut assign the performLocalAuth config directive to our
  // local var
  this._hasLocalAuth = !!this.config(ssd.user.auth.ConfigKeys.HAS_LOCAL_AUTH);

  this.logger.config('init() :: Local auth enabled: ' +
    this._hasLocalAuth + ' auth sources registered: ' +
    this._mapSources.getCount());

  var deferreds = [];
  this._mapSources.forEach( function( key, sourceItem ) {
    this.logger.fine('init() :: Initializing plugin:' + key);
    deferreds.push( sourceItem.inst.init() );
  }, this);

  return new goog.async.DeferredList(deferreds);
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
      eventObj.type = ssd.user.auth.EventType.BEFORE_SET;
    break;
    case ssd.structs.DynamicMap.EventType.AFTER_SET:
      eventObj.type = ssd.user.auth.EventType.AFTER_SET;
    break;
    case ssd.structs.DynamicMap.EventType.BEFORE_ADDALL:
      eventObj.type = ssd.user.auth.EventType.BEFORE_ADDALL;
    break;
    case ssd.structs.DynamicMap.EventType.AFTER_ADDALL:
      eventObj.type = ssd.user.auth.EventType.AFTER_ADDALL;
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
 * @throws {Error} If selfObj not instance of ssd.user.auth.PluginModule
 *   or has already registered.
 */
ssd.user.Auth.prototype.addExtSource = function(selfObj) {
  this.logger.info('addExtSource() :: Adding auth source:' + selfObj.SOURCEID);

  // check if plugin is of right type
  if (!selfObj instanceof ssd.user.auth.PluginModule) {
    throw new TypeError();
  }
  // check if plugin already registered
  if (this._mapSources.get(selfObj.SOURCEID)) {
    throw new Error(ssd.user.Auth.Error.ALREADY_REGISTERED + selfObj.SOURCEID);
  }

  /**
   * @type {ssd.user.Auth.SourceItem}
   */
  var sourceItem = {
     sourceId        : selfObj.SOURCEID,
     inst            : selfObj,
     initAuthStatus  : false,
     isAuthed        : false
   };

  // add the new plugin to our map
  this._mapSources.set(selfObj.SOURCEID, sourceItem);

  // register the plugin as a method in this instance
  this[selfObj.SOURCEID] = selfObj;

  // event listeners
  selfObj.addEventListener(ssd.user.auth.EventType.INITIAL_EXT_AUTH_STATE,
    this._initAuthStatus, false, this);
  selfObj.addEventListener(ssd.user.auth.EventType.EXT_AUTH_CHANGE,
    this._authChange, false, this);
};


/**
 * Registration to Core
 *
 * @param {ssd.Core} ssdInst
 */
ssd.user.Auth.onRegisterRun = function( ssdInst ) {

  ssd.user.Auth.prototype.logger.shout('onRegisterRun() :: Module registers. ' +
    'Core instance: ' + ssdInst._instanceCount);

  /**
   * The instance of the user auth class
   * @type {ssd.user.Auth}
   */
  ssdInst.user = new ssd.user.Auth( ssdInst );

  // bubble user auth events to core.
  ssdInst.user.setParentEventTarget( ssdInst._instance );

  // assign isAuthed method
  ssdInst.isAuthed = goog.bind(ssdInst.user.isAuthed, ssdInst.user);

  // initialize ext auth plugins
  ssd.register.runPlugins( ssd.user.Auth.MODULE_NAME, ssdInst.user._instance );

  // register the init method
  ssd.register.init( ssdInst.user.init, ssdInst.user );

};
ssd.register.module( ssd.user.Auth.onRegisterRun );

