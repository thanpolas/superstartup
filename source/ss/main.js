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
 * @license Apache License, Version 2.0
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 03/Mar/2010
 * @package Superstartup library
 */

 /** @fileoverview Superstartup library bootstrap file */

goog.provide('ss');
goog.provide('s');
goog.require('ss.debug');
goog.provide('ss.config');
goog.provide('ss.Core');
goog.require('ss.metrics');
goog.require('ss.error');
goog.require('ss.metadata');
goog.require('ss.ajax');
goog.require('ss.ready');
goog.require('ss.Events');
goog.require('ss.user');
goog.require('ss.Config');
goog.require('ss.user.auth.Facebook');
goog.require('ss.user.auth.Twitter');
goog.require('ss.helpers');
goog.require('ss.web.system');
goog.require('ss.web.cookies');
goog.require('ss.web.user');
goog.require('s');
goog.require('ss.server2js');
goog.require('ss.exports');






/**
 * Debuging option, set to false for production
 * @define {boolean}
 */
ss.DEBUG = true;

/**
 * ONSERVER switch.
 * @define {boolean}
 */
ss.ONSERVER = false;

/**
 * Pre - production switch
 * @define {boolean}
 */
ss.PREPROD = false;

/**
 * Switch to true when the superstartup library has
 * initialized all and is ready to roll
 * @type {boolean}
 */
ss.READY = false;

/** @type {ss.Config} Singleton config instance */
ss.config = ss.Config.getInstance();

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
  
  /** @type {ss.Config} Singleton config instance */
  this.config = ss.Config.getInstance();  
  
  /**
   * The instance of the user auth class
   * @type {ss.user.Auth}
   */
  this.user;  
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
  /**
   * The instance of the user auth class
   * @type {ss.user.Auth}
   */
  this.user = ss.user.Auth.getInstance();
  
  // initialize ext auth plugins
  ss.user.auth.Facebook.getInstance();
  ss.user.auth.Twitter.getInstance();
 
};


// synchronous execution
// hooks for server2js
// start of synchronous (silent) initialization of the library
(function(){


  // init our exposed API
  var s = goog.global.s = ss.Core.getInstance();  
  // wake up the monster
  s.synchInit();
    
  var newUserEvent = function() {
    // trigger new user event
    ss.user.auth.events.runEvent('newUser');
  };

  // hook for authed user from server
  //ss.server2js.hook('102', ss.user.auth.login, 50);

  // analytics
  ss.server2js.hook('analytics', ss.metrics.init);

  // new user event
  ss.server2js.hook('121', newUserEvent);

  // metadata init call
  ss.server2js.hook('metadata', ss.metadata.init);

  // Write permanent cookie request (first time ever visitor)
  ss.server2js.hook('25', ss.web.cookies.writePermCook);


})();