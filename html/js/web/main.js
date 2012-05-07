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
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * createdate 30/Apr/2011
 *
 */

goog.provide('web');

goog.require('core');

goog.require('web.system');
goog.require('web.cookies');

goog.require('web.jq.ext');

goog.require('web.user');



goog.require('goog.debug');
goog.require('goog.debug.FancyWindow');
goog.require('goog.debug.Logger');
goog.require('goog.debug.LogManager');


// Add your required files from here on...
goog.require('web.myapp');




/**
 * Our global variables
 *
 * @type {Object}
 */
web.db = {
  fbClicked: false
}

/**
 * If visitor is accessing our page from a mobile device
 *
 * @type {boolean}
 */
web.MOB = false;

/**
 * Set DOM Ready main hook
 *
 * @param {Function}
 */
$().ready(function(){
  web.INIT();
});

/**
 * The main initialiser for web
 * Triggers when we have a DOCUMENT READY event from DOM
 *
 * @return {void}
 */
web.INIT = function () {


  var w = web, c = core;

  var log = c.log('web.INIT');

  log.info('Init');
  var win = window;
  var j = win.jQuery;
  
  c.db.URL = win.location.protocol + '//' + win.location.hostname;

  // execute the tag lander to parse injected JS instructions from
  // the server
  w.system.tagLanderParse();
  
  // Init the core framework
  c.Init();

  // initialize the web2.0 (FB/Twitter)
  // AUTH BALL IS HERE
  c.fb.InitWeb();

  // start loading twitter's widgets after 500ms
  setTimeout(function(){
    var twString = '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>';
    j('body').append(twString);
    // start init cycle for our twitter lib
    c.twit.Init();
  }, 500);  
  

}; // web.INIT


/**
 * Will popup a debuging funcy window
 *
 */
web.openFancyWin = function () {
  var debugWindow = new goog.debug.FancyWindow('main');
  debugWindow.setEnabled(true);
  debugWindow.init();
}; // method web.openFancyWin


