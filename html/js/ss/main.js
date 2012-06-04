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
 * @package Superstartup framework
 *
 *********
 *  File:: main.js
 *
 *********
 *
 */
 
 /** @fileoverview Superstartup library bootstrap file */

goog.provide('ss');
goog.require('ss.debug');
goog.require('ss.metrics');
goog.require('ss.error');
goog.require('ss.metadata');
goog.require('ss.ajax');
goog.require('ss.ready');
goog.require('ss.Events');
goog.require('ss.user');
goog.require('ss.conf');
goog.require('ss.web2');
goog.require('ss.CONSTS');
goog.require('ss.helpers');
goog.require('ss.exports');
goog.require('ss.server2js');
goog.require('ss.web.system');
goog.require('ss.web.cookies');
goog.require('ss.web.user');


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

/**
 * Global db (hash of values)
 * @type {Object}
 */
ss.db = {};

/** @type {goog.debug.Logger.getLogger} shortcut assign */
ss.log = goog.debug.Logger.getLogger;

/**
 * The Init function triggers inline as soon as execution
 * reaches this point. Based on our requirement schema, this file
 * is the last to be included.
 *
 * @return {void}
 */
ss.init = function ()
{
    var logger = goog.debug.Logger.getLogger('ss.Init');
    if (goog.DEBUG) {
      ss.debug.openFancyWin();
    }
    
    logger.info('Starting...');
    var main = ss.ready('main');
    main.addCheck('loaded');

    // Initialize web specific operations
    // Auth Ball is here
    ss.webInit();

    ss.READY = true;
    main.check('loaded');

}; // function ss.Init



/**
 * The initialiser for web
 * Keep web logic isolated from our library's core for 
 * easy exclusion when run on other environments
 *
 * @return {void}
 */
ss.webInit = function () 
{
  ss.db.URL = window.location.protocol + '//' + window.location.hostname;

  // initialize the web2.0 (FB/Twitter)
  // AUTH BALL IS HERE
  ss.fb.InitWeb();    
  // start init cycle for our twitter lib
  ss.twit.init();

  // start loading twitter's widgets after 500ms
  setTimeout(function(){
    var twString = '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>';
    $('body').append(twString);    
  }, 500);  
  

}; // ss.webInit


// inline execution - hooks for server2js
(function(ss){
  var newUserEvent = function() {
    // trigger new user event
    ss.user.auth.events.runEvent('newUser');      
  };
    
  // hook for authed user from server
  ss.server2js.hook('102', ss.user.auth.login, 50);
  
  // analytics
  ss.server2js.hook('analytics', ss.metrics.init);

  // new user event
  ss.server2js.hook('121', newUserEvent);
  
  // metadata init call
  ss.server2js.hook('metadata', ss.metadata.init);
  
  // Write permanent cookie request (first time ever visitor)
  ss.server2js.hook('25', ss.web.cookies.writePermCook);
  
  // wake up the monster
  ss.init();
})(ss);
