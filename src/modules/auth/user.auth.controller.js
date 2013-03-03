/**
 * @fileoverview Handles user authentication.
 *
 */
goog.provide('ssd.user.Auth');
goog.provide('ssd.user.Auth.Error');

goog.require('goog.async.Deferred');

goog.require('ssd.user.AuthModel');
goog.require('ssd.user.AuthLogin');
goog.require('ssd.user.auth.config');

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
 * @param {Function} capsule the result of invocator.
 * @constructor
 * @extends {ssd.user.AuthLogin}
 */
ssd.user.Auth = function( capsule ) {

  this.logger.info('ctor() :: Instantiating Auth module...');

  goog.base(this);

  /**
   * @type {ssd.Core}
   */
  this._ssdInst = capsule._instance;

  /** @type {ssd.Config} */
  this.config = this._ssdInst.config.prependPath( ssd.user.auth.config.PATH );

  /**
   * Config parameters
   */
  this.config.addAll( ssd.user.auth.config.defaults );

  /**
   * @type {Function}
   * @private
   */
  this._capsule = ssd.invocator.encapsulate(this, this._dynmapUdo.getSet);
  return this._capsule;

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
  this._hasLocalAuth = !!this.config(ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL);

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
 * @param {Function} capsule
 */
ssd.user.Auth.onRegisterRun = function( capsule ) {

  ssd.user.Auth.prototype.logger.shout('onRegisterRun() :: Module registers. ' +
    'Core instance: ' + capsule._instance._instanceCount);

  /**
   * The instance of the user auth class
   * @type {ssd.user.Auth}
   */
  capsule.user = new ssd.user.Auth( capsule );

  // bubble user auth events to core.
  capsule.user.setParentEventTarget( capsule._instance );

  // assign isAuthed method
  capsule.isAuthed = goog.bind(capsule.user.isAuthed, capsule.user);

  // initialize ext auth plugins
  ssd.register.runPlugins( ssd.user.Auth.MODULE_NAME, capsule.user );

  // register the init method
  ssd.register.init( capsule.user.init, capsule.user );

};
ssd.register.module( ssd.user.Auth.onRegisterRun );

