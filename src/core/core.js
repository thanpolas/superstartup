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


  // The default key we will use to determine
  // success or failure of an AJAX request
  //
  // This key is expected to exist in all the responses
  // from the server
  //
  // This key can be overwritten by any module
  //
  // If you set this key to null then it will not be used
  // and we'll assume that once a response callback is
  // triggered it is considered successful by default.
  this.config(ssd.Core.CONFIG_STATUS, 'status');

  // The true value of this key.
  //
  // Typically this is boolean true, however this
  // may not be the case for everyone.
  //
  // This key can be overwritten by any module
  this.config(ssd.Core.CONFIG_STATUS_TRUE, true);

};
goog.inherits(ssd.Core, ssd.Module);
goog.addSingletonGetter(ssd.Core);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.Core.CONFIG_PATH = 'core';
/** @const {string} The key of the state config param */
ssd.Core.CONFIG_STATUS = 'status';
/** @const {string} The key of the status true config param */
ssd.Core.CONFIG_STATUS_TRUE = 'statusTrue';

ssd.Core.prototype.logger = goog.debug.Logger.getLogger('ssd.Core');

/**
 * The synchronous init
 * This init is called synchronously as soon as the lib is loaded
 * You can find the call at the end of this file
 *
 * Will initialize all classes and prepare library to get started
 *
 * @return {void}
 */
ssd.Core.prototype.synchInit = function()
{
  if (goog.DEBUG) {
    ssd.debug.openFancyWin();
  }
  this.logger.info('synchInit() :: Starting...');

  /**
   * The instance of the user auth class
   * @type {ssd.user.Auth}
   */
  this.user = ssd.user.Auth.getInstance();

  // set out instance as the parent event target for auth
  this.user.setParentEventTarget(this);


  // bubble user auth events to this class
  this.user.setParentEventTarget(this);

  // initialize ext auth plugins
  ssd.user.auth.Facebook.getInstance();
  ssd.user.auth.Twitter.getInstance();

};

/**
 * Kicks off the library.
 *
 * This function is exposed and is invoked by our handlers
 *
 * @param  {Function=} optCallback A callback for when ready ops finish.
 * @return {void}
 */
ssd.Core.prototype.init = function (optCallback)
{
  this.logger.info('Core init(). Kicking off Super Startup');
  // start authentication process
  this.user.init(optCallback);
};

/**
 * Declare our identity
 * @return {string}
 */
ssd.Core.prototype.toString = function() {
  return 'ssd.Core';
};

/**
 * Generic listener method for all events emitted by ss
 *
 * @param  {string} eventType The event type.
 * @param  {Function} cb The callback function.
 * @param {Object=} opt_self optionally define a context to invoke the callback on.
 */
ssd.Core.prototype.listen = function(event, cb, opt_self)
{
  goog.events.listen(this, event, cb, false, opt_self || goog.global);
};


// synchronous execution
// start of synchronous (silent) initialization of the library
(function(){

  // wake up the monster
  ssd.core = ssd.invocator( ssd.Core, 'init' );

})();
