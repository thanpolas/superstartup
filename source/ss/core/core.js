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

goog.provide('ss.Core');

goog.require('ss.Module');
goog.require('ss.Config');
goog.require('ss.server2js');
goog.require('ss.metrics');
goog.require('ss.user.Auth');
goog.require('ss.user.auth.Facebook');
goog.require('ss.user.auth.Twitter');
goog.require('ss.metadata');
goog.require('ss.web.cookies');

/**
 * The base class
 *
 * This class will be exported as our main entry point
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.Core = function()
{
  goog.base(this);

  /**
   * We overwrite the module's fancySetGet instance
   * with the actual config singleton instance.
   *
   * @type {ss.Config} Singleton config instance.
   */
  this.config = ss.Config.getInstance();

  /** @type {ss.Config} Singleton config instance */
  //ss.config = ss.Config.getInstance();

  /**
   * The instance of the user auth class
   * @type {ss.user.Auth}
   */
  this.user = ss.user.Auth.getInstance();
};
goog.inherits(ss.Core, ss.Module);
goog.addSingletonGetter(ss.Core);

ss.Core.prototype.logger = goog.debug.Logger.getLogger('ss.Core');

/**
 * Kicks off the library.
 *
 * This funcion is exposed and is invoked by our handlers
 *
 * @return {void}
 */
ss.Core.prototype.init = function ()
{
  this.logger.info('Kicking off init()');
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
ss.Core.prototype.synchInit = function()
{

  if (goog.DEBUG) {
    ss.debug.openFancyWin();
  }
  this.logger.info('synchInit() Starting...');

  // bubble user auth events to this class
  this.user.setParentEventTarget(this);

  // initialize ext auth plugins
  ss.user.auth.Facebook.getInstance();
  ss.user.auth.Twitter.getInstance();

};


// synchronous execution
// hooks for server2js
// start of synchronous (silent) initialization of the library
(function(){

  // wake up the monster
  ss.Core.getInstance().synchInit();

  var newUserEvent = function() {
    // trigger new user event
    ss.user.auth.events.runEvent('newUser');
  };

  var serv = ss.Server2js.getInstance();

  // hook for authed user from server
  //serv.hook('102', ss.user.auth.login, 50);

  // analytics
  serv.hook('analytics', ss.metrics.init);

  // new user event
  serv.hook('121', newUserEvent);

  // metadata init call
  serv.hook('metadata', ss.metadata.init);

  // Write permanent cookie request (first time ever visitor)
  serv.hook('25', ss.web.cookies.writePermCook);

})();
