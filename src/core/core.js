/**
 * Superstartup
 *
 *
 * Copyright 2000-2013 Athanasios Polychronakis.
 * createdate 10/Jul/2012
 */

 /** @fileoverview The core API class */

goog.provide('ssd.Core');
goog.provide('ss');

goog.require('ssd.vendor');
goog.require('ssd.Module');
goog.require('ssd.Config');
goog.require('ssd.metrics');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.Facebook');
goog.require('ssd.user.auth.Twitter');
goog.require('ssd.metadata');
goog.require('ssd.web.cookies');
goog.require('ssd.register');
goog.require('ssd.sync');
goog.require('ssd.core.config');

/**
 * The base class
 *
 * This class will be exported as our main entry point
 *
 * @constructor
 * @extends {ssd.Module}
 */
ssd.Core = function() {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this._isReady = false;

  /**
   * @type {when.Defer}
   * @private
   */
  this._readyDefer = when.defer();

  if (goog.DEBUG) {
    this._readyDefer.promise.ensure(goog.bind(this.logger.info, this,
      'ctor() :: Core Deferred resolved.'));
  }

  if (goog.DEBUG) {
    ssd.debug.openFancyWin();
  }

  this.logger.info('ctor() :: Initializing. Count: ' + ssd._instanceCount);

  this.sync = ssd.sync;
  this.ajax = ssd.ajax;

  this.logger.info('ctor() :: Registering modules...');

  /**
   * @type {ssd.Config} The configuration class.
   */
  this.config = new ssd.Config();
  this.config.addAll( ssd.core.config.defaults );


  /**
   * The singleton instance of the user auth class
   * @type {ssd.user.Auth}
   */
  this.user = ssd.user.Auth.getInstance(this);

  this.isAuthed = this.user.isAuthed;
  //
  // hack
  // run encapsulator before we run modules so we won't need to
  // do deep copy of the selfObj
  //
  var selfObj = ssd.invocator.encapsulate( this, this.init );

  selfObj.user = this.user;

  // ssd.register.runModules( selfObj );

  return selfObj;

};
goog.inherits(ssd.Core, ssd.Module);

ssd.Core.prototype.logger = goog.debug.Logger.getLogger('ssd.Core');

ssd.Core.prototype.log = goog.debug.Logger.getLogger('myapp');


/**
 * Events triggered by core
 * @enum {string}
 */
ssd.Core.EventType = {
  INIT: 'init'
};

/**
 * A custom getInstance method for the Auth class singleton.
 *
 * We want this custom method so as to return a proper
 * encapsulated instance that is binded (when invoked will
 * execute) the 'get' method.
 *
 *
 * @return {Function} The encapsulated instance.
 */
ssd.Core.getInstance = function()
{
  return ssd.Core._instance ||
    (ssd.Core._instance = new ssd.Core());
};


/**
 * Kicks off the library.
 *
 * This function is exposed and is invoked by our handlers
 *
 * @param  {Function=} optCallback A callback for when ready ops finish.
 * @return {when.Promise} a promise.
 */
ssd.Core.prototype.init = function (optCallback) {
  this.logger.info('init() :: Kicking off SuperStartup. isReady:' + this._isReady);
  var fn = optCallback || ssd.noop;

  if ( this._isReady ) {
    fn();
    return this._readyDefer.promise;
  }

  var initPromise = this.user.init();

  initPromise.ensure(goog.bind(function(){
      this._isReady = true;
      this.dispatchEvent( ssd.Core.EventType.INIT );
    }, this));
  initPromise.ensure(this._readyDefer.resolve);
  initPromise.ensure(fn);

  return initPromise;
};

/**
 * Declare our identity
 * @return {string}
 */
ssd.Core.prototype.toString = function() {
  return 'superstartup';
};

/**
 * @return {boolean} If ss is ready.
 */
ssd.Core.prototype.isReady = function() {
  return this._isReady;
};

/**
 * Generic listener method for all events emitted by ss
 *
 * @param {Object | goog.events.Event | null | string} event object
 * @param  {[type]}   event   [description]
 * @param {Function} cb The callback function.
 * @param {Object=} optSelf optionally define a context to invoke the callback on.
 * @return {goog.events.ListenableKey} a unique event key.
 */
ssd.Core.prototype.listen = function(event, cb, optSelf) {
  return goog.events.listen( this, event, cb, false, optSelf || goog.global);
};

/**
 * [trigger description]
 * @param  {Object | goog.events.Event | null | string} event object
 * @return {boolean} If anyone called preventDefault on the event object
 *   (or if any of the handlers returns false) this will also return false.
 *   If there are no handlers, or if all handlers return true,
 *   this returns true.
 */
ssd.Core.prototype.trigger = function( event ) {
  return goog.events.dispatchEvent( this, event );
};

/**
 * [trigger description]
 * @param  {[type]} key [description]
 * @param  {goog.events.ListenableKey } key The key from listen().
 * @return {boolean} indicating whether the listener was there to remove.
 */
ssd.Core.prototype.unlisten = function( key ) {
  return goog.events.unlistenByKey( key );
};

/**
 * [trigger description]
 * @param  {string=} optType Optionally narrow down to specific type.
 * @return {number} Number of listeners removed.
 */
ssd.Core.prototype.removeAllListeners = function( optType ) {
  return goog.events.removeAll( this, optType);
};

/**
 * Synchronous (silent) initialization of the library.
 * @type {ssd.Core}
 */
ss = ssd.Core.getInstance();

