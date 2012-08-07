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
goog.require('ssd.server2js');
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

  /**
   * We overwrite the module's fancySetGet instance
   * with the actual config singleton instance.
   *
   * @type {ssd.Config} Singleton config instance.
   */
  this.config = ssd.Config.getInstance();

  /** @type {ssd.Config} Singleton config instance */
  //ssd.config = ssd.Config.getInstance();

  /**
   * The instance of the user auth class
   * @type {ssd.user.Auth}
   */
  this.user = ssd.user.Auth.getInstance();
};
goog.inherits(ssd.Core, ssd.Module);
goog.addSingletonGetter(ssd.Core);

ssd.Core.prototype.logger = goog.debug.Logger.getLogger('ssd.Core');

/**
 * Kicks off the library.
 *
 * This funcion is exposed and is invoked by our handlers
 *
 * @return {void}
 */
ssd.Core.prototype.init = function ()
{
  this.logger.info('Core init(). Kicking off Super Startup');
  // start authentication process
  this.user.init();
};

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
  this.logger.info('synchInit() Starting...');

  // bubble user auth events to this class
  this.user.setParentEventTarget(this);

  // initialize ext auth plugins
  ssd.user.auth.Facebook.getInstance();
  ssd.user.auth.Twitter.getInstance();

};


// synchronous execution
// hooks for server2js
// start of synchronous (silent) initialization of the library
(function(){

  // wake up the monster
  ssd.core = ssd.Core.getInstance();
  ssd.core.synchInit();

  var serv = ssd.Server2js.getInstance();

  // hook for authed user from server
  //serv.hook('102', ssd.user.auth.login, 50);

  // analytics
  serv.hook('analytics', ssd.metrics.init);

  // new user event
  //serv.hook('121', newUserEvent);

  // metadata init call
  serv.hook('metadata', ssd.metadata.init);

  // Write permanent cookie request (first time ever visitor)
  serv.hook('25', ssd.web.cookies.writePermCook);

})();
