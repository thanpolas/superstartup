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

goog.provide('ss');

goog.provide('ss.DEBUG');
goog.provide('ss.READY'); //DOM ready switch


goog.require('goog.debug');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');

goog.require('ss.metrics');
goog.require('ss.error');

goog.require('ss.metadata');

goog.require('ss.ajax');
goog.require('ss.ready');
goog.require('ss.events');
goog.require('ss.user');
goog.require('ss.conf');
goog.require('ss.web2');
goog.require('ss.STATIC');
goog.require('ss.helpers');

goog.require('ss.exports');

goog.require('ss.server2js');


/**
 * Debuging option, set to false for production
 * @type {boolean}
 */
ss.DEBUG = true;

/**
 * ONSERVER switch.
 * @type {boolean}
 */
ss.ONSERVER = false;

/**
 * Pre - production switch
 * @type {boolean}
 */
ss.PREPROD = false;

/**
 * Mobile application mode
 *
 * @type {boolean}
 */
ss.MOBILE = false;

/**
 * WEB app mode
 *
 * @type {boolean}
 */
ss.WEB = false;

/**
 * If we have tracking (on web production)
 *
 *
 */

if (ss.ONSERVER)
  ss.WEBTRACK = true;
else
  ss.WEBTRACK = false;

ss.MOBILE = false;
ss.WEB = true;


/**
 * Switch to true when DOM fires the ready() event
 * @define {boolean}
 */
ss.READY = false;

/**
 * Global db (hash of values)
 *
 */
ss.db = {};

/**
 * Shortcut assign google's getLogger method to ours
 *
 */
ss.log = goog.debug.Logger.getLogger;

/**
 * Suppresses all logging done by the Superstartup framework
 *
 * @type {boolean}
 */
ss.canLog = true;

/**
 * The Init function should be called whenever
 * our environment is loaded and ready.
 *
 *
 * @return {void}
 */
ss.Init = function ()
{
    log = ss.log('ss.Init');
    log.info('Starting...');
    ss.ready('main');
    ss.ready.addCheck('main', 'loaded');

    // the ready trigger for every other functionality beyond the framework
    ss.ready('ready');
    // for now this watch is finished at the end of taglander parse...
    ss.ready.addCheck('ready', 'alldone');

    ss.READY = true;
    ss.ready.check('main', 'loaded');

}; // function ss.Init

/**
 * Trigger when server passes us environment data
 *
 * @param {Object}
 * @return {void}
 */
ss.envReady = function(data)
{
  if (data['DEVEL'])
    ss.DEBUG = true;
  if (data['PRODUCTION'])
    ss.ONSERVER = true;
  if (data['PREPROD'])
    ss.PREPROD = true;
  
  ss.web.openFancyWin();  
};

// inline execution - hooks for server2js
(function(ss){
  // hook for environment data from server
  ss.server2js.hook('5', ss.envReady, 10);
  
  // hook for authed user from server
  ss.server2js.hook('102', ss.user.auth.login, 50);
  
  // analytics
  ss.server2js.hook('analytics', ss.metrics.init);

  // new user event
  ss.server2js.hook('121', newUserEvent);
  
  // metadata init call
  ss.server2js.hook('metadata', ss.metadata.init);
  
  var newUserEvent = function() {
    // trigger new user event
    ss.user.auth.events.runEvent('newUser');      
  };
})(ss);
