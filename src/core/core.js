/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * createdate 10/Jul/2012
 */

 /** @fileoverview The core API class */

goog.provide('ssd.Core');
goog.provide('ssd.c');

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
 * An instance counter.
 * @type {number}
 * @private
 */
ssd._instanceCount = 0;

/**
 * The base class
 *
 * This class will be exported as our main entry point
 *
 * @constructor
 * @extends {ssd.Module}
 */
ssd.Core = function()
{
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this._isReady = false;

  /**
   * @type {number} The current instance count.
   * @private
   */
  this._instanceCount = ++ssd._instanceCount;

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

  //
  // hack
  // run encapsulator before we run modules so we won't need to
  // do deep copy of the selfObj
  //
  var selfObj = ssd.invocator.encapsulate( this, this.init );

  ssd.register.runModules( selfObj );

  return selfObj;

};
goog.inherits(ssd.Core, ssd.Module);
goog.addSingletonGetter(ssd.Core);

ssd.Core.prototype.logger = goog.debug.Logger.getLogger('ssd.Core');

/**
 * Events triggered by core
 * @enum {string}
 */
ssd.Core.EventType = {
  INIT: 'ss.init'
};


/**
 * Kicks off the library.
 *
 * This function is exposed and is invoked by our handlers
 *
 * @param  {Function=} optCallback A callback for when ready ops finish.
 * @return {goog.async.Deferred|ssd.Core} a deferred for init operation or
 *   a new instance if called with the 'new' keyword.
 */
ssd.Core.prototype.init = function (optCallback) {

  // this.logger.info('init() :: Determine if invoked with new keyword:' +
  //     this instanceof ssd.Core, this._instanceCount, this.__seenBefore);

  // As init is the method exposed as 'ss' we need to support
  // getting called as a constructor with the 'new' keyword
  // and supply a new instance of superstartup.
  // http://stackoverflow.com/questions/367768/how-to-detect-if-a-function-is-called-as-constructor
  //
  if ( !(this instanceof ssd.Core) && !this.__seenBefore) {
    this.__seenBefore = true;
    return new ssd.Core();
  }

  this.logger.info('init() :: Kicking off Super Startup. Instance count:' +
    this._instanceCount);


  var fn = optCallback || ssd.noop;

  // start modules initialization and wait till finished
  return ssd.register.runModuleInits( this )
    .addBoth( function() {
      this._isReady = true;
      this.dispatchEvent( ssd.Core.EventType.INIT );
    }, this)
    .addBoth( fn );

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
 * No operation function
 */
ssd.noop = function(){};


/**
 * Synchronous (silent) initialization of the library.
 * @type {ssd.Core}
 */
ssd.c = new ssd.Core();

