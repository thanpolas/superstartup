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

  this._loadModules();
};
goog.inherits(ssd.Core, ssd.Module);
goog.addSingletonGetter(ssd.Core);

ssd.Core.prototype.logger = goog.debug.Logger.getLogger('ssd.Core');

/**
 * Will check what modules are available and synchronously init them.
 *
 * @return {void}
 * @private
 */
ssd.Core.prototype._loadModules = function()
{
  if (goog.DEBUG) {
    ssd.debug.openFancyWin();
  }
  this.logger.info('_loadModules() :: Starting...');


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
