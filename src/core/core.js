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
goog.provide('ssd.core');

goog.require('ssd.Module');
goog.require('ssd.Config');
goog.require('ssd.metrics');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.Facebook');
goog.require('ssd.user.auth.Twitter');
goog.require('ssd.metadata');
goog.require('ssd.web.cookies');
goog.require('ssd.register');

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
  this._instanceCount = ssd._instanceCount++;

  if (goog.DEBUG) {
    ssd.debug.openFancyWin();
  }

  this.logger.info('ctor() :: Initializing. Count: ' + ssd._instanceCount);
  this.logger.info('ctor() :: Registering modules...');


  ssd.register.runModules( this );

  return ssd.invocator.encapsulate( this, this.init );

};
goog.inherits(ssd.Core, ssd.Module);
goog.addSingletonGetter(ssd.Core);

ssd.Core.prototype.logger = goog.debug.Logger.getLogger('ssd.Core');

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
    .addBoth(fn)
    .addBoth( function() {this._isReady = true;}, this);
};

/**
 * Declare our identity
 * @return {string}
 */
ssd.Core.prototype.toString = function() {
  return 'ssd.Core';
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
 * @param  {string} eventType The event type.
 * @param  {Function} cb The callback function.
 * @param {Object=} optSelf optionally define a context to invoke the callback on.
 */
ssd.Core.prototype.listen = function(event, cb, optSelf) {
  goog.events.listen(this, event, cb, false, optSelf || goog.global);
};

/**
 * No operation function
 */
ssd.noop = function(){};


// start of synchronous (silent) initialization of the library
// wake up the monster
//ssd.core = ssd.invocator( ssd.Core, 'init' );
ssd.core = ssd.Core.getInstance();

